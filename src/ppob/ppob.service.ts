import {
    Injectable,
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import {
    PurchasePPOBDto,
    InquiryPPOBDto,
    CheckPPOBStatusDto,
    UpdatePPOBProductDto,
    PPOBTransactionDto,
    CreatePPOBProductDto,
    CheckPPOBDto,

} from './dto';
import {
    TripayProduct,
    TripayTransactionResponse,
    TripayCallbackData,
    TripayProductListResponse,
} from './interfaces/tripay.interface';
import {
    PPOBTransactionResponse,
    PPOBProductResponse,
    PPOBListResponse,
    PPOBStatsResponse,
} from './interfaces/ppob.interface';

@Injectable()
export class PpobService {
    private readonly tripayApiKey: string;
    private readonly tripayPrivateKey: string;
    private readonly tripayMerchantCode: string;
    private readonly tripayBaseUrl: string;
    private readonly tripayCallbackUrl: string;

    constructor(
        private readonly prisma: PrismaService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.tripayApiKey = this.configService.get<string>('tripay.apiKey') || '';
        this.tripayPrivateKey = this.configService.get<string>('tripay.privateKey') || '';
        this.tripayMerchantCode = this.configService.get<string>('tripay.merchantCode') || '';
        this.tripayBaseUrl = this.configService.get<string>('tripay.baseUrl') || '';
        this.tripayCallbackUrl = this.configService.get<string>('tripay.callbackUrl') || '';
    }
    private generateSignature(merchantRef: string, amount: number): string {
        const data = this.tripayMerchantCode + merchantRef + amount;
        return crypto
            .createHmac('sha256', this.tripayPrivateKey)
            .update(data)
            .digest('hex');
    }

    private generateReferenceId(): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `PPOB${timestamp}${random}`;
    }


    async getProducts(type?: string): Promise<PPOBProductResponse[]> {
        try {
            const url = `${this.tripayBaseUrl}/merchant/fee-calculator`;
            const headers = {
                Authorization: `Bearer ${this.tripayApiKey}`,
            };

            const response = await firstValueFrom(
                this.httpService.get<TripayProductListResponse>(url, { headers }),
            );

            if (!response.data.success) {
                throw new BadRequestException('Gagal mengambil data produk dari Tripay');
            }

            let products = response.data.data || [];


            if (type) {
                products = products.filter((p: TripayProduct) =>
                    p.category.toLowerCase() === type.toLowerCase(),
                );
            }

            return products.map((p) => ({
                code: p.code,
                name: p.name,
                type: p.category,
                price: p.price,
                adminFee: 0,
                totalPrice: p.price,
                description: p.desc,
                status: p.buyer_product_status ? 'available' : 'unavailable',
                stock: p.stock,
            }));
        } catch (error) {
            throw new InternalServerErrorException(
                `Gagal mengambil produk PPOB: ${error.message}`,
            );
        }
    }

    async inquiry(dto: InquiryPPOBDto) {
        try {
            const products = await this.getProducts(dto.productType);

            if (!products || products.length === 0) {
                throw new NotFoundException(
                    `Produk ${dto.productType} tidak ditemukan`,
                );
            }

            return {
                success: true,
                message: 'Data produk berhasil diambil',
                data: products,
            };
        } catch (error) {
            throw new BadRequestException(
                `Gagal inquiry produk: ${error.message}`,
            );
        }
    }


    async purchase(dto: PurchasePPOBDto): Promise<PPOBTransactionResponse> {
        try {

            const user = await this.prisma.user.findUnique({
                where: { id: dto.userId },
            });

            if (!user) {
                throw new NotFoundException('User tidak ditemukan');
            }


            const products = await this.getProducts(dto.productType);
            const product = products.find((p) => p.code === dto.productCode);

            if (!product) {
                throw new NotFoundException('Produk tidak ditemukan');
            }

            if (product.status !== 'available') {
                throw new BadRequestException('Produk sedang tidak tersedia');
            }

            const totalPrice = product.totalPrice;
            const adminFee = product.adminFee;


            if (Number(user.saldo) < totalPrice) {
                throw new BadRequestException('Saldo tidak mencukupi');
            }


            const referenceId = this.generateReferenceId();


            const transaction = await this.prisma.pPOBTransaction.create({
                data: {
                    reference_id: referenceId,
                    product_code: dto.productCode,
                    product_name: product.name,
                    product_type: dto.productType,
                    target: dto.target,
                    price: product.price,
                    admin_fee: adminFee,
                    total_price: totalPrice,
                    status: 'pending',
                    email: dto.email || user.email,
                    user_id: dto.userId,
                },
            });


            await this.prisma.user.update({
                where: { id: dto.userId },
                data: {
                    saldo: {
                        decrement: totalPrice,
                    },
                },
            });


            const updatedTransaction = await this.prisma.pPOBTransaction.update({
                where: { id: transaction.id },
                data: {
                    status: 'success',
                    tripay_reference: referenceId,
                    tripay_status: 'PAID',
                    sn: `SN${Date.now()}`,
                    message: 'Transaksi berhasil diproses',
                },
            });

            return this.mapToResponse(updatedTransaction);
        } catch (error) {
            throw new BadRequestException(
                `Gagal melakukan pembelian: ${error.message}`,
            );
        }
    }


    async checkStatus(dto: CheckPPOBStatusDto): Promise<PPOBTransactionResponse> {
        const transaction = await this.prisma.pPOBTransaction.findUnique({
            where: { reference_id: dto.referenceId },
        });

        if (!transaction) {
            throw new NotFoundException('Transaksi tidak ditemukan');
        }

        return this.mapToResponse(transaction);
    }


    async handleCallback(callbackData: { merchant_ref: string; reference: string; status: string; note?: string }): Promise<void> {
        try {
            const transaction = await this.prisma.pPOBTransaction.findFirst({
                where: { reference_id: callbackData.merchant_ref },
            });

            if (!transaction) {
                throw new NotFoundException('Transaksi tidak ditemukan');
            }


            await this.prisma.pPOBTransaction.update({
                where: { id: transaction.id },
                data: {
                    tripay_reference: callbackData.reference,
                    tripay_status: callbackData.status,
                    status: this.mapTripayStatus(callbackData.status),
                    message: callbackData.note,
                },
            });


            if (
                callbackData.status === 'FAILED' ||
                callbackData.status === 'EXPIRED'
            ) {
                await this.prisma.user.update({
                    where: { id: transaction.user_id },
                    data: {
                        saldo: {
                            increment: Number(transaction.total_price),
                        },
                    },
                });
            }
        } catch (error) {
            console.error('Error handling callback:', error);
            throw error;
        }
    }


    async getHistory(
        userId: number,
        page: number = 1,
        limit: number = 10,
    ): Promise<PPOBListResponse> {
        const skip = (page - 1) * limit;

        const [transactions, total] = await Promise.all([
            this.prisma.pPOBTransaction.findMany({
                where: { user_id: userId },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.pPOBTransaction.count({
                where: { user_id: userId },
            }),
        ]);

        return {
            data: transactions.map((t) => this.mapToResponse(t)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }


    async getStats(userId: number): Promise<PPOBStatsResponse> {
        const transactions = await this.prisma.pPOBTransaction.findMany({
            where: { user_id: userId },
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayTransactions = transactions.filter(
            (t) => t.created_at >= today,
        ).length;

        const successTransactions = transactions.filter(
            (t) => t.status === 'success',
        ).length;

        const byType = {
            pulsa: transactions.filter((t) => t.product_type === 'pulsa').length,
            paket_data: transactions.filter((t) => t.product_type === 'paket_data')
                .length,
            pln: transactions.filter((t) => t.product_type === 'pln').length,
            bpjs: transactions.filter((t) => t.product_type === 'bpjs').length,
            pdam: transactions.filter((t) => t.product_type === 'pdam').length,
        };

        const totalVolume = transactions.reduce(
            (sum, t) => sum + Number(t.total_price),
            0,
        );

        return {
            totalTransactions: transactions.length,
            totalVolume,
            byType,
            successRate:
                transactions.length > 0
                    ? (successTransactions / transactions.length) * 100
                    : 0,
            todayTransactions,
        };
    }


    private mapTripayStatus(tripayStatus: string): string {
        const statusMap: Record<string, string> = {
            UNPAID: 'pending',
            PAID: 'success',
            FAILED: 'failed',
            EXPIRED: 'failed',
            REFUND: 'refunded',
        };

        return statusMap[tripayStatus] || 'pending';
    }


    private mapToResponse(transaction: any): PPOBTransactionResponse {
        return {
            id: transaction.id,
            referenceId: transaction.reference_id,
            productCode: transaction.product_code,
            productName: transaction.product_name,
            productType: transaction.product_type,
            target: transaction.target,
            price: Number(transaction.price),
            adminFee: Number(transaction.admin_fee),
            totalPrice: Number(transaction.total_price),
            status: transaction.status,
            userId: transaction.user_id,
            createdAt: transaction.created_at,
            updatedAt: transaction.updated_at,
            sn: transaction.sn,
            message: transaction.message,
            tripayReference: transaction.tripay_reference,
            tripayStatus: transaction.tripay_status,
        };
    }

    async createProduct(dto: CreatePPOBProductDto) {
        return await this.prisma.pPOBProduct.create({
            data: {
                code: dto.code,
                name: dto.name,
                type: dto.type,
                price: dto.price,
                adminFee: dto.adminFee,
                description: dto.description,
                provider: dto.provider,
                stock: dto.stock ?? 0,
                status: dto.status ?? 'active',
            },
        });
    }
    async findAllProducts(filter: any) {
        const page = Number(filter.page) || 1;
        const limit = Number(filter.limit) || 10;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (filter.type) where.type = filter.type;
        if (filter.provider) where.provider = filter.provider;

        const [data, total] = await this.prisma.$transaction([
            this.prisma.pPOBProduct.findMany({ where, skip, take: limit }),
            this.prisma.pPOBProduct.count({ where }),
        ]);

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOneProduct(id: number) {
        return await this.prisma.pPOBProduct.findUnique({ where: { id } });
    }

    async findProductByCode(code: string) {
        return await this.prisma.pPOBProduct.findUnique({ where: { code } });
    }

    async updateProduct(id: number, dto: UpdatePPOBProductDto) {
        return await this.prisma.pPOBProduct.update({
            where: { id },
            data: dto,
        });
    }

    async deleteProduct(id: number) {
        await this.prisma.pPOBProduct.delete({ where: { id } });
        return { message: 'Produk PPOB berhasil dihapus' };
    }

    async createTransaction(dto: PPOBTransactionDto) {
        return await this.prisma.pPOBTransaction.create({
            data: {
                product_code: dto.productCode,
                product_type: dto.productType,
                target: dto.target,
                price: dto.amount ?? 0,
                total_price: dto.amount ?? 0,
                user_id: dto.userId,
                email: dto.email,
                status: 'pending',
                reference_id: crypto.randomUUID(),
                product_name: dto.productCode
            },
        });
    }

    async findAllTransactions(filter: any) {
        const page = Number(filter.page) || 1;
        const limit = Number(filter.limit) || 10;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (filter.userId) where.userId = filter.userId;
        if (filter.status) where.status = filter.status;

        const [data, total] = await this.prisma.$transaction([
            this.prisma.pPOBTransaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
            }),
            this.prisma.pPOBTransaction.count({ where }),
        ]);

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOneTransaction(id: number) {
        return await this.prisma.pPOBTransaction.findUnique({ where: { id } });
    }
    async checkBill(dto: CheckPPOBDto) {
        const product = await this.prisma.pPOBProduct.findUnique({
            where: { code: dto.productCode },
        });
        if (!product) throw new Error('Produk tidak ditemukan');

        return {
            productCode: dto.productCode,
            target: dto.target,
            amount: product.price + (product.adminFee ?? 0),
            message: 'Bill check success',
        };
    }

    async syncProductsFromTripay(marginPercent: number) {
        const response = await fetch('https://tripay.co.id/api/merchant/produk', {
            headers: { Authorization: `Bearer ${process.env.TRIPAY_KEY}` },
        });

        const data = await response.json();

        let synced = 0;
        let failed = 0;

        for (const item of data.data) {
            try {
                const sellPrice = Math.floor(item.price + (item.price * (marginPercent / 100)));

                await this.prisma.pPOBProduct.upsert({
                    where: { code: item.code },
                    update: {
                        name: item.name,
                        type: item.type,
                        price: sellPrice,
                        adminFee: item.admin_fee ?? 0,
                        status: item.status,
                        provider: 'Tripay',
                    },
                    create: {
                        code: item.code,
                        name: item.name,
                        type: item.type,
                        price: sellPrice,
                        adminFee: item.admin_fee ?? 0,
                        status: item.status,
                        provider: 'Tripay',
                    },
                });
                synced++;
            } catch (error) {
                failed++;
                console.error(`Gagal sync produk ${item.code}:`, error);
            }
        }
        return { success: true, message: 'Products synced from Tripay', synced, failed };
    }

}
