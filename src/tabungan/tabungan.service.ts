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
    TabunganStatResponseDto,
    RiwayatTabunganResponseDto,
    RiwayatTabunganListResponseDto
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

    async findAll(filter: FilterTabunganDto = {}): Promosi<TabunganListResponseDto> {
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
                            select: { id: true, name: true, email: true }
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
}
