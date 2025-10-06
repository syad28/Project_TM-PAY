import { Injectable, HttpException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateTabunganDto,
    UpdateTabunganDto,
    SetorTabunganDto,
    TarikTabunganDto,
    FilterTabunganDto,
    TabunganResponseDto,
    TabunganListResponseDto,
    TabunganStatsResponseDto,

} from './dto';

@Injectable()
export class TabunganService {
    constructor(private prisma: PrismaService) { }

    async create(createTabunganDto: CreateTabunganDto): Promise<TabunganResponseDto> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: createTabunganDto.userId }
            });
            if (!user) {
                throw new BadRequestException('User tidak ditemukan');
            }

            const tabungan = await this.prisma.tabungan.create({
                data: {
                    nama: createTabunganDto.nama,
                    target: createTabunganDto.target,
                    deadline: createTabunganDto.deadline ? new Date(createTabunganDto.deadline) : null,
                    progres: 0,
                    status: 'active',
                    userId: createTabunganDto.userId,
                },
                include: {
                    user: {
                        select: { id: true, nama: true, email: true }
                    }
                }
            });

            console.log(`Tabungan created: ${tabungan.nama} by user ${user.email}`);
            return this.formatTabunganResponse(tabungan);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Gagal membuat tabungan', 500);
        }
    }

    async findAll(filter: FilterTabunganDto = {}): Promise<TabunganListResponseDto> {
        try {
            const page = filter.page || 1;
            const limit = filter.limit || 10;
            const skip = (page - 1) * limit;

            const where: any = {};

            if (filter.search) {
                where.nama = { contains: filter.search };
            }

            if (filter.status) where.status = filter.status;
            if (filter.userId) where.userId = filter.userId;

            if (filter.startDate || filter.endDate) {
                where.createdAt = {};
                if (filter.startDate) where.createdAt.gte = new Date(filter.startDate);
                if (filter.endDate) where.createdAt.lte = new Date(filter.endDate);
            }

            const [tabungan, total] = await Promise.all([
                this.prisma.tabungan.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        user: {
                            select: { id: true, nama: true, email: true }
                        }
                    },
                    orderBy: { [filter.sortBy || 'createdAt']: filter.sortOrder || 'desc' }
                }),
                this.prisma.tabungan.count({ where })
            ]);
            const data = tabungan.map(t => this.formatTabunganResponse(t));

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
            throw new HttpException('Gagal mengambil data tabungan', 500);
        }
    }


    async findOne(id: number): Promise<TabunganResponseDto> {
        try {
            const tabungan = await this.prisma.tabungan.findUnique({
                where: { id },
                include: {
                    user: {
                        select: { id: true, nama: true, email: true }
                    }
                }
            });

            if (!tabungan) {
                throw new HttpException('Tabungan tidak ditemukan', 404);
            }

            return this.formatTabunganResponse(tabungan);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Gagal membuat tabungan', 500);
        }
    }

    async update(id: number, updateTabunganDto: UpdateTabunganDto): Promise<TabunganResponseDto> {
        try {
            const existingTabungan = await this.prisma.tabungan.findUnique({
                where: { id }
            });

            if (!existingTabungan) {
                throw new HttpException('Tabungan tidak ditemukan', 404);
            }
            const updatedTabungan = await this.prisma.tabungan.update({
                where: { id },
                data: {
                    ...updateTabunganDto,
                    deadline: updateTabunganDto.deadline ? new Date(updateTabunganDto.deadline) : undefined
                },
                include: {
                    user: {
                        select: { id: true, nama: true, email: true }
                    }
                }
            });

            console.log(`Tabungan updated: ${updatedTabungan.nama}`);
            return this.formatTabunganResponse(updatedTabungan);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Gagal mengupdate tabungan', 500);
        }
    }
    async remove(id: number, userId?: number): Promise<{ message: string }> {
        try {
            const tabungan = await this.prisma.tabungan.findUnique({
                where: { id }
            });

            if (!tabungan) {
                throw new HttpException('Tabungan tidak ditemukan', 404);
            }

            if (userId && tabungan.userId !== userId) {
                throw new ForbiddenException('Tidak dapat menghapus tabungan milik user lain');
            }

            await this.prisma.tabungan.delete({
                where: { id }
            });

            return { message: 'Tabungan berhasil dihapus' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Gagal menghapus tabungan', 500);
        }
    }
    // setor tarik tabungan
    async setorTabungan(setorDto: SetorTabunganDto): Promise<{ message: string; tabungan: TabunganResponseDto }> {
        try {
            return await this.prisma.$transaction(async (tx) => {

                const [user, tabungan] = await Promise.all([
                    tx.user.findUnique({ where: { id: setorDto.userId } }),
                    tx.tabungan.findUnique({ where: { id: setorDto.tabunganId } })
                ]);

                if (!user) throw new BadRequestException('User tidak ditemukan');
                if (!tabungan) throw new BadRequestException('Tabungan tidak ditemukan');

                if (tabungan.userId !== setorDto.userId) {
                    throw new ForbiddenException('Tidak dapat setor ke tabungan milik user lain');
                }
                // cek status
                if (tabungan.status !== 'active') {
                    throw new BadRequestException('Tabungan tidak aktif');
                }
                if (Number(user.saldo) < setorDto.jumlah) {
                    throw new BadRequestException('Saldo tidak mencukupi');
                }

                await tx.user.update({
                    where: { id: setorDto.userId },
                    data: { saldo: Number(user.saldo) - setorDto.jumlah }
                });

                const newProgres = Number(tabungan.progres) + setorDto.jumlah;
                const updatedTabungan = await tx.tabungan.update({
                    where: { id: setorDto.tabunganId },
                    data: {
                        progres: newProgres,
                        status: newProgres >= Number(tabungan.target) ? 'completed' : 'active'
                    },
                    include: {
                        user: {
                            select: { id: true, nama: true, email: true }
                        }
                    }
                });

                await tx.transaksi.create({
                    data: {
                        jenis: 'setor',
                        jumlah: setorDto.jumlah,
                        metode: setorDto.metode || 'saldo',
                        userId: setorDto.userId,
                        tabunganId: setorDto.tabunganId,
                    }
                });


                console.log(`Setor tabungan: ${setorDto.jumlah} to ${tabungan.nama} `);

                return {
                    message: `Berhasil setor Rp ${setorDto.jumlah.toLocaleString()} ke ${tabungan.nama}`,
                    tabungan: this.formatTabunganResponse(updatedTabungan)
                };
            });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Gagal melakukan setor tabungan', 500);
        }
    }

    async tarikTabungan(tarikDto: TarikTabunganDto): Promise<{ message: string; tabungan: TabunganResponseDto }> {
        try {
            return await this.prisma.$transaction(async (tx) => {

                const [user, tabungan] = await Promise.all([
                    tx.user.findUnique({ where: { id: tarikDto.userId } }),
                    tx.tabungan.findUnique({ where: { id: tarikDto.tabunganId } })

                ]);

                if (!user) throw new BadRequestException('User tidak ditemukan');
                if (!tabungan) throw new BadRequestException('Tabungan tidak ditemukan');

                if (tabungan.userId !== tarikDto.userId) {
                    throw new ForbiddenException('Tidak dapat tarik dari tabungan milik ');
                }
                if (tabungan.status !== 'active') {
                    throw new BadRequestException('Tabungan tidak aktif');
                }
                if (Number(user.saldo) < tarikDto.jumlah) {
                    throw new BadRequestException('Saldo tidak mencukupi');
                }

                await tx.user.update({
                    where: { id: tarikDto.userId },
                    data: { saldo: Number(user.saldo) + tarikDto.jumlah }
                });

                const newProgres = Number(tabungan.progres) - tarikDto.jumlah;
                const updatedTabungan = await tx.tabungan.update({
                    where: { id: tarikDto.tabunganId },
                    data: {
                        progres: newProgres,
                        status: newProgres >= Number(tabungan.target) ? 'completed' : 'active'
                    },
                    include: {
                        user: {
                            select: { id: true, nama: true, email: true }
                        }
                    }
                });

                await tx.transaksi.create({
                    data: {
                        jenis: 'tarik',
                        jumlah: tarikDto.jumlah,
                        metode: tarikDto.metode || 'saldo',
                        userId: tarikDto.userId,
                        tabunganId: tarikDto.tabunganId,
                    }
                });

                console.log(`Tarik tabungan: ${tarikDto.jumlah} to ${tabungan.nama}`);

                return {
                    message: `Berhasil tarik Rp${tarikDto.jumlah.toLocaleString()} ke ${tabungan.nama} `,
                    tabungan: this.formatTabunganResponse(updatedTabungan)
                };
            });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Gagal melakukan tarik tabungan', 500);

        }
    }


    async getStats(userId?: number): Promise<TabunganStatsResponseDto> {
        try {
            const where = userId ? { userId } : {};
            const [
                totalTabungan,
                activeTabungan,
                completedTabungan,
                cancelledTabungan,
                targetAgg,
                progressAgg,
                nearDeadline
            ] = await Promise.all([
                this.prisma.tabungan.count({ where }),
                this.prisma.tabungan.count({ where: { ...where, status: 'active' } }),
                this.prisma.tabungan.count({ where: { ...where, status: 'completed' } }),
                this.prisma.tabungan.count({ where: { ...where, status: 'cancelled' } }),
                this.prisma.tabungan.aggregate({
                    where,
                    _sum: { target: true }
                }),
                this.prisma.tabungan.aggregate({
                    where,
                    _sum: { progres: true }
                }),
                this.prisma.tabungan.count({
                    where: {
                        ...where,
                        deadline: {
                            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) /*30 hari */
                        },
                        status: 'active'
                    }
                })
            ]);

            const totalTargetAmount = Number(targetAgg._sum.target) || 0;
            const totalProgressAmount = Number(progressAgg._sum.progres) || 0;
            const averageProgress = totalTabungan > 0 ? (totalProgressAmount / totalTargetAmount) * 100 : 0;
            const completionRate = totalTabungan > 0 ? (completedTabungan / totalTabungan) * 100 : 0;


            return {
                totalTabungan,
                activeTabungan,
                completedTabungan,
                cancelledTabungan,
                totalTargetAmount,
                totalProgressAmount,
                averageProgress: Math.round(averageProgress * 100) / 100,
                nearDeadline,
                completionRate: Math.round(completionRate * 100) / 100
            };
        } catch (error) {
            throw new HttpException('Gagal mengambil statistik tabungan', 500);
        }
    }

    private formatTabunganResponse(tabungan: any): TabunganResponseDto {
        const target = Number(tabungan.target);
        const progres = Number(tabungan.progres);
        const persentaseProgres = target > 0 ? Math.round((progres / target) * 100) : 0;
        const sisaTarget = Math.max(0, target - progres);

        return {
            id: tabungan.id,
            nama: tabungan.nama,
            target,
            progres,
            deadline: tabungan.deadline,
            status: tabungan.status,
            createdAt: tabungan.createdAt,
            persentaseProgres,
            sisaTarget,
            user: tabungan.user
        };
    }
}

