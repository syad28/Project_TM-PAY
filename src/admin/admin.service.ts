import { Injectable, HttpException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
    CreateAdminDto,
    UpdateAdminDto,
    ChangeAdminPasswordDto,
    AdminLoginDto,
    AdminUserManagementDto,
    AdminAdjustBalanceDto,
    AdminResponseDto,
    AdminDashboardStatsDto,
    AdminLogActivityDto,
    AdminUserDetailDto,
    AdminTransactionReportDto
} from './dto';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(createAdminDto: CreateAdminDto): Promise<any> {
        try {
            if (createAdminDto.password !== createAdminDto.password_confirmation) {
                throw new BadRequestException('Password dan konfirmasi password tidak sama');
            }

            const existingAdmin = await this.prisma.admin.findUnique({
                where: { email: createAdminDto.email }
            });

            if (existingAdmin) {
                throw new BadRequestException('Email admin sudah terdaftar');
            }

            const hashedPassword = await bcrypt.hash(createAdminDto.password, 12);

            const admin = await this.prisma.admin.create({
                data: {
                    nama: createAdminDto.nama,
                    email: createAdminDto.email,
                    password: hashedPassword,
                    role: createAdminDto.role || 'admin',
                }
            });

            await this.logActivity(admin.id, 'admin_registered', `Admin ${admin.nama} registered`);

            const { password, ...adminData } = admin;
            return adminData;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Gagal mendaftarkan admin', 500);

        }
    }

    async login(loginDto: AdminLoginDto) {
        try {
            const admin = await this.prisma.admin.findUnique({
                where: { email: loginDto.email }
            });

            if (!admin) {
                throw new BadRequestException('Email atau password salah');
            }

            const isPasswordValid = await bcrypt.compare(loginDto.password, admin.password);
            if (!isPasswordValid) {
                throw new BadRequestException('Email atau password salah');
            }

            const payload = { sub: admin.id, email: admin.email, role: admin.role, type: 'admin' };
            const access_token = this.jwtService.sign(payload, { expiresIn: '8h' });

            await this.logActivity(admin.id, 'admin_login', `Admin ${admin.nama} logged in`);

            const { password, ...adminData } = admin;
            return {
                access_token,
                expires_in: 8 * 60 * 60,
                token_type: 'Bearer',
                admin: adminData
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Gagal login admin', 500);
        }
    }

    async getDashboard(): Promise<AdminDashboardStatsDto> {
        try {
            const now = new Date();
            const startOfToday = new Date(now.setHours(0, 0, 0, 0));
            const startOfWeek = new Date(now.setDate(now.getDate() - 7));
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const [
                totalUsers,
                activeUsers,
                blockedUsers,
                newUsersToday,
                newUsersWeek,
                newUsersMonth,

                totalTransactions,
                transactionsToday,
                transactionsWeek,
                transactionsMonth,
                transactionVolume,
                transactionByType,

                totalTabungan,
                activeTabungan,
                completedTabungan,
                tabunganTarget,
                tabunganProgress,

                userBalance,

                pendingVerifications,
                activeAdmins
            ] = await Promise.all([
                this.prisma.user.count({ where: { deletedAt: null } }),
                this.prisma.user.count({ where: { status_akun: 'active', deletedAt: null } }),
                this.prisma.user.count({ where: { status_akun: 'blocked', deletedAt: null } }),
                this.prisma.user.count({ where: { createdAt: { gte: startOfToday }, deletedAt: null } }),
                this.prisma.user.count({ where: { createdAt: { gte: startOfWeek }, deletedAt: null } }),
                this.prisma.user.count({ where: { createdAt: { gte: startOfMonth }, deletedAt: null } }),

                this.prisma.transaksi.count(),
                this.prisma.transaksi.count({ where: { tanggal: { gte: startOfToday } } }),
                this.prisma.transaksi.count({ where: { tanggal: { gte: startOfWeek } } }),
                this.prisma.transaksi.count({ where: { tanggal: { gte: startOfMonth } } }),
                this.prisma.transaksi.aggregate({ _sum: { jumlah: true } }),
                this.prisma.transaksi.groupBy({ by: ['jenis'], _count: true, _sum: { jumlah: true } }),

                this.prisma.tabungan.count(),
                this.prisma.tabungan.count({ where: { status: 'active' } }),
                this.prisma.tabungan.count({ where: { status: 'completed' } }),
                this.prisma.tabungan.aggregate({ _sum: { target: true } }),
                this.prisma.tabungan.aggregate({ _sum: { progres: true } }),

                this.prisma.user.aggregate({ where: { deletedAt: null }, _sum: { saldo: true }, _avg: { saldo: true } }),

                this.prisma.user.count({ where: { OR: [{ email_verified: false }, { phone_verified: false }], deletedAt: null } }),
                this.prisma.admin.count()
            ]);

            const byType = {
                topup: 0,
                transfer: 0,
                setor: 0,
                tarik: 0
            };

            transactionByType.forEach(t => {
                if (t.jenis in byType) {
                    byType[t.jenis] = Number(t._sum.jumlah) || 0;
                }
            });

            return {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    blocked: blockedUsers,
                    newToday: newUsersToday,
                    newThisWeek: newUsersWeek,
                    newThisMonth: newUsersMonth
                },
                transactions: {
                    total: totalTransactions,
                    today: transactionsToday,
                    thisWeek: transactionsWeek,
                    thisMonth: transactionsMonth,
                    totalVolume: Number(transactionVolume._sum.jumlah) || 0,
                    byType
                },
                tabungan: {
                    total: totalTabungan,
                    active: activeTabungan,
                    completed: completedTabungan,
                    totalTarget: Number(tabunganTarget._sum.target) || 0,
                    totalProgress: Number(tabunganProgress._sum.progres) || 0
                },
                financial: {
                    totalBalance: Number(userBalance._sum.saldo) || 0,
                    averageBalance: Number(userBalance._avg.saldo) || 0,
                    totalTransactionVolume: Number(transactionVolume._sum.jumlah) || 0
                },

                system: {
                    pendingVerifications,
                    reportedIssues: 0,
                    activeAdmins
                }
            };

        } catch (error) {
            throw new HttpException('Gagal ambil statistik dashboard', 500);
        }
    }
    async getUserDetail(userId: number): Promise<AdminUserDetailDto> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    transaksi: { take: 10, orderBy: { tanggal: 'desc' } },
                    tabungan: { take: 5, orderBy: { createdAt: 'desc' } }
                }
            });

            if (!user) {
                throw new HttpException('User tidak ditemukan', 404);
            }

            const [totalTransactions, totalTabungan] = await Promise.all([
                this.prisma.transaksi.count({ where: { userId } }),
                this.prisma.tabungan.count({ where: { userId } })
            ]);

            return {
                id: user.id,
                nama: user.nama,
                email: user.email,
                no_hp: user.no_hp,
                saldo: Number(user.saldo),
                status_akun: user.status_akun,
                role: user.role,
                email_verified: user.email_verified,
                phone_verified: user.phone_verified,
                ktp_verified: user.ktp_verified,
                last_login_at: user.last_login_at,
                createdAt: user.createdAt,
                statistics: {
                    totalTransactions,
                    totalTabungan
                },
                recentTransactions: user.transaksi,
                recentTabungan: user.tabungan
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Gagal mengambil data user', 500);
        }
    }


    async blockUser(userId: number, adminId: number, reason?: string): Promise<any> {
        try {
            const user = await this.prisma.user.update({
                where: { id: userId },
                data: { status_akun: 'blocked' }
            });

            await this.logActivity(adminId, 'user_blocked', `Blocked user ${user.nama} (${user.email})${reason ? ` : ${reason}` : ''}`);

            return { message: `User ${user.nama} berhasil di blokir`, user };
        } catch (error) {
            throw new HttpException('Gagal memblokir user', 500);
        }
    }

    async unblockUser(userId: number, adminId: number): Promise<any> {
        try {
            const user = await this.prisma.user.update({
                where: { id: userId },
                data: { status_akun: 'active' }
            });

            await this.logActivity(adminId, 'user_unblocked', `Unblocked user ${user.nama} (${user.email})`);

            return { message: `User ${user.nama} berhasil membuka blokiran`, user };
        } catch (error) {
            throw new HttpException('Gagal membuka blokir user', 500);
        }
    }

    async adjustUserBalance(userId: number, adminId: number, adjustDto: AdminAdjustBalanceDto): Promise<any> {
        try {
            const amount = parseFloat(adjustDto.amount);

            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                throw new HttpException('User tidak dtemukan', 404);
            }

            const currentSaldo = Number(user.saldo);
            const newSaldo = currentSaldo + amount;

            if (newSaldo < 0) {
                throw new BadRequestException('Saldo tidak boleh negatif');
            }

            const updateUser = await this.prisma.user.update({
                where: { id: userId },
                data: { saldo: newSaldo }
            });

            await this.logActivity(
                adminId,
                'balance_adjusted',
                `Adjust balance for ${user.nama}: ${amount > 0 ? '+' : ''}${amount}. Reason: ${adjustDto.reason}`
            );

            return {
                meesage: `Saldo user ${user.nama} berhasil disesuaikan`,
                previousBalance: currentSaldo,
                adjustment: amount,
                newBalance: newSaldo,
                reason: adjustDto.reason
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Gagal menyesuaikan saldo user', 500);
        }
    }

    async getTransactionReport(startDate?: string, endDate?: string): Promise<AdminTransactionReportDto> {
        try {
            const where: any = {};

            if (startDate) where.tanggal = { gte: new Date(startDate) };
            if (endDate) where.tanggal = { ...where.tanggal, lte: new Date(endDate) };

            const [transactions, byType] = await Promise.all([
                this.prisma.transaksi.findMany({ where, include: { user: { select: { nama: true } } } }),
                this.prisma.transaksi.groupBy({
                    where,
                    by: ['jenis'],
                    _count: true,
                    _sum: { jumlah: true }
                })
            ]);

            const totalVolume = transactions.reduce((sum, t) => sum + Number(t.jumlah), 0);
            const averageTransactions = transactions.length > 0 ? totalVolume / transactions.length : 0;

            return {
                period: `${startDate || 'all'} to ${endDate || 'now'}`,
                summary: {
                    totalTransactions: transactions.length,
                    totalVolume,
                    averageTransactions
                },
                byType: byType.map(t => ({
                    type: t.jenis,
                    count: t._count,
                    volume: Number(t._sum.jumlah) || 0
                })),
                byDay: [],
                topUsers: []
            };
        } catch (error) {
            throw new HttpException(' Gagal generate laporan transaksi', 500);
        }
    }

    async findAllAdmins(): Promise<any[]> {
        try {
            const admins = await this.prisma.admin.findMany({
                select: {
                    id: true,
                    nama: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            return admins;
        } catch (error) {
            throw new HttpException('Gagal mengambil data admin', 500);
        }
    }

    async updateAdmin(id: number, updateDto: UpdateAdminDto): Promise<any> {
        try {
            const admin = await this.prisma.admin.update({
                where: { id },
                data: updateDto,
                select: { id: true, nama: true, email: true, role: true, createdAt: true, updatedAt: true }
            });
            return admin;
        } catch (error) {
            throw new HttpException('Gagal mengupdate admin', 500);
        }
    }

    async changePassword(adminId: number, changePasswordDto: ChangeAdminPasswordDto): Promise<{ message: string }> {
        try {
            if (changePasswordDto.new_password !== changePasswordDto.new_password_confirmation) {
                throw new BadRequestException('Password baru dan konfirmasi tidak sama');
            }

            const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
            if (!admin) {
                throw new HttpException('Admin tidak ditemukan', 404);
            }

            const isValid = await bcrypt.compare(changePasswordDto.current_password, admin.password);
            if (!isValid) {
                throw new BadRequestException('Password lama tidak benar');
            }

            const hashedPassword = await bcrypt.hash(changePasswordDto.new_password, 12);
            await this.prisma.admin.update({
                where: { id: adminId },
                data: { password: hashedPassword }
            });

            await this.logActivity(adminId, 'password_changed', 'Admin changed password');

            return { message: 'Password berhasil diubah' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Gagal mengubah password', 500);
        }
    }
    async getActivityLogs(page: number = 1, limit: number = 50): Promise<any> {
        try {
            const skip = (page - 1) * limit;

            const [logs, total] = await Promise.all([
                this.prisma.logAktivitas.findMany({
                    skip,
                    take: limit,
                    include: { admin: { select: { nama: true, email: true } } },
                    orderBy: { tanggal: 'desc' }
                }),
                this.prisma.logAktivitas.count()
            ]);

            return {
                data: logs,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new HttpException('Gagal mengambil log aktivitas', 500);
        }
    }

    private async logActivity(adminId: number, action: string, description: string) {
        try {
            await this.prisma.logAktivitas.create({
                data: {
                    adminId,
                    aktivitas: `${action}: ${description}`,
                    tanggal: new Date()
                }
            });
        } catch (error) {
            console.error('Failed to log activity: ', error);
        }
    }

}