import { Injectable, HttpException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
import {
    CreateUserDto,
    UpdateUserProfileDto,
    ChangePasswordDto,
    ChangePinDto,
    AdminUpdateUserDto,
    FilterUserDto,
    LoginDto,
    UserResponseDto,
    UserListResponseDto,
    LoginResponseDto,
    UsersAdminResponseDto,
    UserProfileResponseDto,
    UserStatsResponseDto

} from './dto';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        try {
            // Validasi konfirmasi password
            if (createUserDto.password !== createUserDto.password_confirmation) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'Password dan konfirmasi password tidak sama'
                });
            }

            // Cek email sudah terdaftar
            const existingEmail = await this.prisma.user.findUnique({
                where: { email: createUserDto.email }
            });

            if (existingEmail) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'Email sudah terdaftar'
                });
            }

            // Cek nomor HP jika ada
            if (createUserDto.no_hp) {
                const existingPhone = await this.prisma.user.findUnique({
                    where: { no_hp: createUserDto.no_hp }
                });
                if (existingPhone) {
                    throw new BadRequestException({
                        statusCode: 400,
                        message: 'Nomor HP sudah terdaftar'
                    });
                }
            }

            // Hash password dan PIN
            const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
            const hashedPin = createUserDto.pin_transaksi
                ? await bcrypt.hash(createUserDto.pin_transaksi, 12)
                : null;

            // Create user
            const user = await this.prisma.user.create({
                data: {
                    nama: createUserDto.nama,
                    email: createUserDto.email,
                    no_hp: createUserDto.no_hp,
                    password: hashedPassword,
                    pin_transaksi: hashedPin,
                    date_of_birth: createUserDto.date_of_birth ? new Date(createUserDto.date_of_birth) : null,
                    gender: createUserDto.gender,
                    address: createUserDto.address,
                    ktp_number: createUserDto.ktp_number,
                    saldo: 0,
                    password_changed_at: new Date(),
                    status_akun: 'active',
                    role: 'user'
                }
            });

            await this.logUserActivity(user.id, 'register', 'User registered successfully');

            return plainToClass(UserResponseDto, user, { excludeExtraneousValues: true });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException({
                statusCode: 500,
                message: 'Gagal mendaftarkan user'
            }, 500);
        }
    }

    async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<LoginResponseDto> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email: loginDto.email }
            });

            if (!user) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'Email atau password salah'
                });
            }

            // Cek akun terkunci
            if (user.locked_until && user.locked_until > new Date()) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: `Akun terkunci hingga ${user.locked_until.toLocaleString('id-ID')}`
                });
            }

            // Cek status akun
            if (user.status_akun !== 'active') {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'Akun tidak aktif. Hubungi admin untuk mengaktifkan'
                });
            }

            // Validasi password
            const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
            if (!isPasswordValid) {
                await this.handleFailedLogin(user.id);
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'Email atau password salah'
                });
            }

            // Reset failed login attempts
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    failed_login_attempts: 0,
                    locked_until: null,
                    last_login_at: new Date()
                }
            });


            const tokens = await this.generateTokens(user.id, loginDto.remember_me);

            await this.createUserSession(
                user.id,
                tokens.access_token,
                tokens.refresh_token,
                ipAddress,
                userAgent,
                loginDto.device_info
            );

            // Log activity
            await this.logUserActivity(user.id, "login", "User logged in successfully", {
                ip_address: ipAddress,
                user_agent: userAgent
            });

            return {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expires_in: tokens.expires_in,
                token_type: 'Bearer',
                user: plainToClass(UserProfileResponseDto, user, { excludeExtraneousValues: true })
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException({
                statusCode: 500,
                message: 'Gagal melakukan login'
            }, 500);
        }
    }

    async logout(userId: number, token: string): Promise<{ message: string }> {
        try {
            await this.prisma.userSession.deleteMany({
                where: {
                    user_id: userId,
                    token: token
                }
            });

            await this.logUserActivity(userId, 'logout', 'User logged out successfully');

            return { message: 'Berhasil logout' };
        } catch (error) {
            throw new HttpException({
                statusCode: 500,
                message: 'Gagal logout'
            }, 500);
        }
    }

    async findAll(filter: FilterUserDto): Promise<UserListResponseDto> {
        try {
            const page = filter.page || 1;
            const limit = filter.limit || 10;
            const skip = (page - 1) * limit;

            const where: any = { deletedAt: null };

            // Search filter
            if (filter.search) {
                where.OR = [
                    { nama: { contains: filter.search, mode: 'insensitive' } },
                    { email: { contains: filter.search, mode: 'insensitive' } }
                ];
            }

            // Filter by status, role, gender
            if (filter.status_akun) where.status_akun = filter.status_akun;
            if (filter.role) where.role = filter.role;
            if (filter.gender) where.gender = filter.gender;

            // Date filter
            if (filter.startDate || filter.endDate) {
                where.createdAt = {};
                if (filter.startDate) where.createdAt.gte = new Date(filter.startDate);
                if (filter.endDate) where.createdAt.lte = new Date(filter.endDate);
            }

            const [users, total] = await Promise.all([
                this.prisma.user.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { [filter.sortBy || 'createdAt']: filter.sortOrder || 'desc' }
                }),
                this.prisma.user.count({ where })
            ]);

            const data = users.map(user =>
                plainToClass(UserResponseDto, user, { excludeExtraneousValues: true })
            );

            return {
                data,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            throw new HttpException({
                statusCode: 500,
                message: 'Gagal mengambil data user'
            }, 500);
        }
    }

    async findOne(id: number): Promise<UserResponseDto> {
        try {
            const user = await this.prisma.user.findFirst({
                where: { id, deletedAt: null }
            });

            if (!user) {
                throw new HttpException({
                    statusCode: 404,
                    message: 'User tidak ditemukan'
                }, 404);
            }

            return plainToClass(UserResponseDto, user, { excludeExtraneousValues: true });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException({
                statusCode: 500,
                message: 'Gagal mengambil data user'
            }, 500);
        }
    }

    async updateProfile(id: number, updateUserProfileDto: UpdateUserProfileDto): Promise<UserProfileResponseDto> {
        try {
            const existingUser = await this.prisma.user.findFirst({
                where: { id, deletedAt: null }
            });

            if (!existingUser) {
                throw new HttpException({
                    statusCode: 404,
                    message: 'User tidak ditemukan'
                }, 404);
            }

            // Validasi nomor HP unik
            if (updateUserProfileDto.no_hp && updateUserProfileDto.no_hp !== existingUser.no_hp) {
                const existingPhone = await this.prisma.user.findUnique({
                    where: { no_hp: updateUserProfileDto.no_hp }
                });
                if (existingPhone && existingPhone.id !== id) {
                    throw new BadRequestException({
                        statusCode: 400,
                        message: 'Nomor HP sudah digunakan user lain'
                    });
                }
            }

            const updateData: any = {
                nama: updateUserProfileDto.nama,
                no_hp: updateUserProfileDto.no_hp,
                gender: updateUserProfileDto.gender,
                address: updateUserProfileDto.address
            };

            // Handle date conversion
            if (updateUserProfileDto.date_of_birth) {
                updateData.date_of_birth = new Date(updateUserProfileDto.date_of_birth);
            }

            const updatedUser = await this.prisma.user.update({
                where: { id },
                data: updateData
            });

            await this.logUserActivity(id, 'profile_update', 'Profile updated successfully');
            return plainToClass(UserProfileResponseDto, updatedUser, { excludeExtraneousValues: true });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException({
                statusCode: 500,
                message: 'Gagal mengupdate profile'
            }, 500);
        }
    }

    async changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
        try {
            if (changePasswordDto.new_password !== changePasswordDto.new_password_confirmation) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'Password baru dan konfirmasi tidak sama'
                });
            }

            const user = await this.prisma.user.findFirst({
                where: { id, deletedAt: null }
            });

            if (!user) {
                throw new HttpException({
                    statusCode: 404,
                    message: 'User tidak ditemukan'
                }, 404);
            }

            const isCurrentPasswordValid = await bcrypt.compare(
                changePasswordDto.current_password,
                user.password
            );

            if (!isCurrentPasswordValid) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'Password lama tidak benar'
                });
            }

            const hashedNewPassword = await bcrypt.hash(changePasswordDto.new_password, 12);

            await this.prisma.user.update({
                where: { id },
                data: {
                    password: hashedNewPassword,
                    password_changed_at: new Date()
                }
            });

            // Hapus semua session (force logout semua device)
            await this.prisma.userSession.deleteMany({
                where: { user_id: id }
            });

            await this.logUserActivity(id, 'password_change', 'Password changed successfully');

            return { message: 'Password berhasil diubah. Silahkan login kembali' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException({
                statusCode: 500,
                message: 'Gagal mengubah password'
            }, 500);
        }
    }

    async changePin(id: number, changePinDto: ChangePinDto): Promise<{ message: string }> {
        try {
            if (changePinDto.new_pin !== changePinDto.new_pin_confirmation) {
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'PIN baru dan konfirmasi tidak sama'
                });
            }

            const user = await this.prisma.user.findFirst({
                where: { id, deletedAt: null }
            });

            if (!user) {
                throw new HttpException({
                    statusCode: 404,
                    message: 'User tidak ditemukan'
                }, 404);
            }

            // Jika user sudah punya PIN, validasi PIN lama
            if (user.pin_transaksi && changePinDto.current_pin) {
                const isCurrentPinValid = await bcrypt.compare(
                    changePinDto.current_pin,
                    user.pin_transaksi
                );

                if (!isCurrentPinValid) {
                    throw new BadRequestException({
                        statusCode: 400,
                        message: 'PIN lama tidak benar'
                    });
                }
            }

            const hashedNewPin = await bcrypt.hash(changePinDto.new_pin, 12);

            await this.prisma.user.update({
                where: { id },
                data: { pin_transaksi: hashedNewPin }
            });

            await this.logUserActivity(id, 'pin_change', 'Transaction PIN changed successfully');

            return { message: 'PIN transaksi berhasil diubah' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException({
                statusCode: 500,
                message: 'Gagal mengubah PIN'
            }, 500);
        }
    }

    async validatePin(id: number, pin: string): Promise<boolean> {
        try {
            const user = await this.prisma.user.findFirst({
                where: { id, deletedAt: null },
                select: { pin_transaksi: true }
            });

            if (!user || !user.pin_transaksi) {
                return false;
            }

            return await bcrypt.compare(pin, user.pin_transaksi);
        } catch (error) {
            return false;
        }
    }


    async adminUpdateUser(id: number, updateDto: AdminUpdateUserDto): Promise<UsersAdminResponseDto> {
        try {
            const updateData: any = { ...updateDto };

            if (updateDto.date_of_birth) {
                updateData.date_of_birth = new Date(updateDto.date_of_birth);
            }

            const user = await this.prisma.user.update({
                where: { id },
                data: updateData
            });

            return plainToClass(UsersAdminResponseDto, user, { excludeExtraneousValues: true });
        } catch (error) {
            throw new HttpException({
                statusCode: 500,
                message: 'Gagal mengupdate user'
            }, 500);
        }
    }

    async softDelete(id: number): Promise<{ message: string }> {
        try {
            await this.prisma.user.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                    status_akun: 'inactive'
                }
            });

            // Hapus semua session user
            await this.prisma.userSession.deleteMany({
                where: { user_id: id }
            });

            await this.logUserActivity(id, 'delete', 'User deleted successfully');

            return { message: 'User berhasil dihapus' };
        } catch (error) {
            throw new HttpException({
                statusCode: 500,
                message: 'Gagal menghapus user'
            }, 500);
        }
    }

    async getStats(): Promise<UserStatsResponseDto> {
        try {
            const [
                totalUsers,
                activeUsers,
                blockedUsers,
                verifiedUsers,
                newUsersThisMonth,
                balanceAgg
            ] = await Promise.all([
                this.prisma.user.count({ where: { deletedAt: null } }),
                this.prisma.user.count({ where: { status_akun: 'active', deletedAt: null } }),
                this.prisma.user.count({ where: { status_akun: 'blocked', deletedAt: null } }),
                this.prisma.user.count({
                    where: {
                        email_verified: true,
                        phone_verified: true,
                        deletedAt: null
                    }
                }),
                this.prisma.user.count({
                    where: {
                        createdAt: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                        },
                        deletedAt: null
                    }
                }),
                this.prisma.user.aggregate({
                    where: { deletedAt: null },
                    _sum: { saldo: true },
                    _avg: { saldo: true }
                })
            ]);

            const totalBalance = balanceAgg._sum.saldo ?
                typeof balanceAgg._sum.saldo === 'object' ?
                    Number(balanceAgg._sum.saldo.toString()) :
                    Number(balanceAgg._sum.saldo) : 0;

            const averageBalance = balanceAgg._avg.saldo ?
                typeof balanceAgg._avg.saldo === 'object' ?
                    Number(balanceAgg._avg.saldo.toString()) :
                    Number(balanceAgg._avg.saldo) : 0;


            return {
                totalUsers,
                activeUsers,
                blockedUsers,
                verifiedUsers,
                newUsersThisMonth,
                totalBalance,
                averageBalance,
                newUserToday: 0,
                loginToday: 0,
                transactionToday: 0,
                TotalTransactions: 0
            };
        } catch (error) {
            throw new HttpException({
                statusCode: 500,
                message: 'Gagal mengambil statistik user'
            }, 500);
        }
    }

    // ========== HELPER METHODS ==========

    private async handleFailedLogin(userId: number): Promise<void> {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) return;

        const failedAttempts = (user.failed_login_attempts || 0) + 1;
        let lockedUntil: Date | null = null;

        // Lock akun setelah 5 kali gagal
        if (failedAttempts >= 5) {
            lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock 30 menit
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                failed_login_attempts: failedAttempts,
                locked_until: lockedUntil
            }
        });
    }

    private async logUserActivity(
        userId: number,
        action: string,
        description: string,
        metadata?: any
    ): Promise<void> {
        try {
            await this.prisma.userActivity.create({
                data: {
                    user_id: userId,
                    action,
                    description,
                    ip_address: metadata?.ip_address,
                    user_agent: metadata?.user_agent,
                    metadata: metadata ? metadata : undefined
                }
            });
        } catch (error) {
            console.error('Gagal log activity:', error);
        }
    }

    private async generateTokens(userId: number, rememberMe: boolean = false) {
        const payload = { sub: userId, type: 'access' };
        const refreshPayload = { sub: userId, type: 'refresh' };

        const expiresIn = rememberMe ? '7d' : '1d';
        const refreshExpiresIn = rememberMe ? '30d' : '7d';

        const access_token = this.jwtService.sign(payload, { expiresIn });
        const refresh_token = this.jwtService.sign(refreshPayload, { expiresIn: refreshExpiresIn });

        return {
            access_token,
            refresh_token,
            expires_in: rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60
        };
    }

    private async createUserSession(
        userId: number,
        token: string,
        refreshToken: string,
        ipAddress?: string,
        userAgent?: string,
        deviceInfo?: string
    ) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.prisma.userSession.create({
            data: {
                user_id: userId,
                token,
                refresh_token: refreshToken,
                device_info: deviceInfo,
                ip_address: ipAddress,
                user_agent: userAgent,
                expires_at: expiresAt
            }
        });
    }
}