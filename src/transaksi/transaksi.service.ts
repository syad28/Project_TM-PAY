import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { translatePrismaError } from '../common/utils/prisma-error.util';
import { CreateTransaksiDto } from './dto/create-transaksi.dto';
import { UpdateTransaksiDto } from './dto/update-transaksi.dto';
import { Decimal } from '@prisma/client/runtime/library';

interface FilterTransaksiDto {
    jenis?: string;
    metode?: string;
    userId?: number;
    tabunganId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}


@Injectable()
export class TransaksiService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateTransaksiDto) {
        try {
            await this.validateTransaksi(dto);

            const result = await this.prisma.$transaction(async (tx) => {
                const user = await tx.user.findUnique({
                    where: { id: dto.userId },
                    select: { id: true, saldo: true, nama: true, email: true, no_hp: true }
                });

                if (!user) {
                    throw new HttpException({
                        statusCode: 400,
                        message: 'User tidak ditemukan'
                    }, 400);
                }
                if (['tarik', 'transfer '].includes(dto.jenis) && user.saldo.toNumber() < dto.jumlah) {
                    throw new HttpException({
                        statusCode: 400,
                        message: 'Saldo tidak mencukupi'
                    }, 400);
                }

                let userTujuan: {
                    id: number;
                    nama: string;
                    email: string;
                    no_hp: string | null;
                } | null = null;
                if (dto.jenis === 'transfer' && dto.userTujuanId) {
                    userTujuan = await tx.user.findUnique({
                        where: { id: dto.userTujuanId },
                        select: { id: true, nama: true, email: true, no_hp: true }
                    });
                    if (!userTujuan) {
                        throw new HttpException({
                            statusCode: 400,
                            message: 'User tujuan tidak ditemukan'
                        }, 400);
                    }
                }
                const transaksi = await tx.transaksi.create({
                    data: {
                        jenis: dto.jenis,
                        jumlah: dto.jumlah,
                        metode: dto.metode,
                        promo: dto.promo,
                        user: { connect: { id: dto.userId } },
                        tabungan: dto.tabunganId ? { connect: { id: dto.tabunganId } } : undefined,
                    },
                    include: {
                        user: {
                            select: { id: true, nama: true, email: true, no_hp: true }
                        },
                        tabungan: true,
                    }
                });
                await this.updateUserSaldo(tx, dto.userId, dto.jenis, dto.jumlah);

                if (dto.jenis === 'transfer' && dto.userTujuanId) {
                    await this.updateUserSaldo(tx, dto.userTujuanId, 'setor', dto.jumlah);
                }

                if (dto.tabunganId) {
                    await this.updateTabunganProgres(tx, dto.tabunganId, dto.jenis, dto.jumlah);
                }

                return transaksi;
            });

            return result;
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            }
            const { status, message } = translatePrismaError(err, {
                model: 'Transaksi',
                fieldMap: { userId: 'userId', tabunganId: 'tabunganId' }
            });
            throw new HttpException({ statusCode: status, message }, status);
        }
    }

    async findAll(filter?: FilterTransaksiDto) {
        const page = filter?.page || 1;
        const limit = filter?.limit || 10;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (filter?.jenis) where.jenis = filter.jenis;
        if (filter?.metode) where.metode = filter.metode;
        if (filter?.userId) where.userId = filter.userId;
        if (filter?.tabunganId) where.tabunganId = filter.tabunganId;

        if (filter?.startDate || filter?.endDate) {
            where.tanggal = {};
            if (filter.startDate) where.tanggal.gte = new Date(filter.startDate);
            if (filter.endDate) where.tanggal.lte = new Date(filter.endDate);
        }

        const [transaksi, total] = await Promise.all([
            this.prisma.transaksi.findMany({
                where,
                include: {
                    user: {
                        select: { id: true, nama: true, email: true, no_hp: true }
                    },
                    tabungan: true,
                },
                orderBy: { tanggal: 'desc' },
                skip,
                take: limit
            }),
            this.prisma.transaksi.count({ where })
        ]);
        return {
            data: transaksi,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async findOne(id: number) {
        const transaksi = await this.prisma.transaksi.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, nama: true, email: true, no_hp: true }
                },
                tabungan: true,
            }
        });

        if (!transaksi) {
            throw new HttpException({
                statusCode: 404,
                message: 'Transaksi tidak ditemukan'
            }, 404);
        }

        return transaksi;
    }

    async update(id: number, dto: UpdateTransaksiDto) {
        try {
            const transaksi = await this.prisma.transaksi.update({
                where: { id },
                data: dto,
                include: {
                    user: {
                        select: { id: true, nama: true, email: true, no_hp: true }
                    },
                    tabungan: true,
                }
            });

            return transaksi;
        } catch (err) {
            const { status, message } = translatePrismaError(err, { model: 'Transaksi' });
            throw new HttpException({ statusCode: status, message }, status);
        }
    }

    async remove(id: number): Promise<{ message: string }> {
        try {
            await this.prisma.transaksi.delete({ where: { id } });
            return { message: 'Transaksi berhasil dihapus' };
        } catch (err) {
            const { status, message } = translatePrismaError(err, { model: 'Transaksi' });
            throw new HttpException({ statusCode: status, message }, status);
        }
    }

    async getStats(userId?: number) {
        const where = userId ? { userId } : {};

        const [
            totalTransaksi,
            totalSetor,
            totalTarik,
            totalTopup,
            totalTransfer,
            transaksiHariIni,
            transaksiMingguIni,
            transaksiBulanIni
        ] = await Promise.all([
            this.prisma.transaksi.count({ where }),
            this.prisma.transaksi.aggregate({
                where: { ...where, jenis: 'setor' },
                _sum: { jumlah: true },
                _count: true
            }),
            this.prisma.transaksi.aggregate({
                where: { ...where, jenis: 'tarik' },
                _sum: { jumlah: true },
                _count: true
            }),
            this.prisma.transaksi.aggregate({
                where: { ...where, jenis: 'topup' },
                _sum: { jumlah: true },
                _count: true
            }),
            this.prisma.transaksi.aggregate({
                where: { ...where, jenis: 'transfer' },
                _sum: { jumlah: true },
                _count: true
            }),
            this.prisma.transaksi.count({
                where: {
                    ...where,
                    tanggal: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            }),
            this.prisma.transaksi.count({
                where: {
                    ...where,
                    tanggal: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            }),
            this.prisma.transaksi.count({
                where: {
                    ...where,
                    tanggal: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            })
        ]);

        return {
            totalTransaksi,
            totalSetor: totalSetor._sum.jumlah || 0,
            totalTarik: totalTarik._sum.jumlah || 0,
            totalTopup: totalTopup._sum.jumlah || 0,
            totalTransfer: totalTransfer._sum.jumlah || 0,
            transaksiHariIni,
            transaksiMingguIni,
            transaksiBulanIni,
        };
    }

    private async validateTransaksi(dto: CreateTransaksiDto): Promise<void> {
        if (dto.tabunganId) {
            const tabungan = await this.prisma.tabungan.findFirst({
                where: {
                    id: dto.tabunganId,
                    userId: dto.userId
                }
            });

            if (!tabungan) {
                throw new HttpException({
                    statusCode: 400,
                    message: 'Tabungan tidak ditemukan atau bukan milik user'
                }, 400);
            }
        }

        if (dto.jenis === 'transfer' && dto.userTujuanId === dto.userId) {
            throw new HttpException({
                statusCode: 400,
                message: 'Tidak dapat transfer ke nomer sendiri'
            }, 400);
        }
    }

    private async updateUserSaldo(tx: any, userId: number, jenis: string, jumlah: number): Promise<void> {
        const user = await tx.user.findUnique({ where: { id: userId } });

        let newSaldo: number;
        if (['setor', 'topup'].includes(jenis)) {
            newSaldo = user.saldo.toNumber() + jumlah;
        } else {
            newSaldo = user.saldo.toNumber() - jumlah;
        }

        await tx.user.update({
            where: { id: userId },
            data: { saldo: newSaldo }
        });
    }

    private async updateTabunganProgres(tx: any, tabunganId: number, jenis: string, jumlah: number): Promise<void> {
        const tabungan = await tx.tabungan.findUnique({ where: { id: tabunganId } });

        if (!tabungan) {
            throw new HttpException({
                statusCode: 400,
                message: 'Tabungan tidak ditemukan'
            }, 400);
        }

        const newProgres = jenis === 'setor'
            ? tabungan.progres.toNumber() + jumlah
            : tabungan.progres.toNumber() - jumlah;

        await tx.tabungan.update({
            where: { id: tabunganId },
            data: { progres: Math.max(0, newProgres) }
        });
    }
}