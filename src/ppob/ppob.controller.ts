import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    ValidationPipe
} from '@nestjs/common';
import { PpobService } from './ppob.service';
import {
    CreatePPOBProductDto,
    UpdatePPOBProductDto,
    PPOBTransactionDto,
    CheckPPOBDto,
    FilterPPOBProductDto,
    FilterPPOBTransactionDto
} from './dto';

@Controller('ppob')
export class PpobController {
    constructor(private readonly ppobService: PpobService) { }

    // ========== PRODUCT ENDPOINTS ==========
    @Post('products')
    @HttpCode(HttpStatus.CREATED)
    async createProduct(@Body(ValidationPipe) createDto: CreatePPOBProductDto) {
        const product = await this.ppobService.createProduct(createDto);
        return {
            statusCode: 201,
            message: 'Produk PPOB berhasil dibuat',
            data: product
        };
    }

    @Get('products')
    async findAllProducts(@Query(ValidationPipe) filter: FilterPPOBProductDto) {
        const result = await this.ppobService.findAllProducts(filter);
        return {
            statusCode: 200,
            message: 'Data produk PPOB berhasil diambil',
            data: result.data,
            meta: result.meta
        };
    }

    @Get('products/:id')
    async findOneProduct(@Param('id', ParseIntPipe) id: number) {
        const product = await this.ppobService.findOneProduct(id);
        return {
            statusCode: 200,
            message: 'Detail produk PPOB berhasil diambil',
            data: product
        };
    }

    @Get('products/code/:kode')
    async findProductByCode(@Param('kode') kode: string) {
        const product = await this.ppobService.findProductByCode(kode);
        return {
            statusCode: 200,
            message: 'Detail produk PPOB berhasil diambil',
            data: product
        };
    }

    @Patch('products/:id')
    async updateProduct(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) updateDto: UpdatePPOBProductDto
    ) {
        const product = await this.ppobService.updateProduct(id, updateDto);
        return {
            statusCode: 200,
            message: 'Produk PPOB berhasil diupdate',
            data: product
        };
    }

    @Delete('products/:id')
    async deleteProduct(@Param('id', ParseIntPipe) id: number) {
        const result = await this.ppobService.deleteProduct(id);
        return {
            statusCode: 200,
            message: result.message
        };
    }

    // ========== TRANSACTION ENDPOINTS ==========
    @Post('transactions')
    @HttpCode(HttpStatus.CREATED)
    async createTransaction(@Body(ValidationPipe) transactionDto: PPOBTransactionDto) {
        const transaction = await this.ppobService.createTransaction(transactionDto);
        return {
            statusCode: 201,
            message: 'Transaksi PPOB berhasil dibuat',
            data: transaction
        };
    }

    @Get('transactions')
    async findAllTransactions(@Query(ValidationPipe) filter: FilterPPOBTransactionDto) {
        const result = await this.ppobService.findAllTransactions(filter);
        return {
            statusCode: 200,
            message: 'Data transaksi PPOB berhasil diambil',
            data: result.data,
            meta: result.meta
        };
    }

    @Get('transactions/:id')
    async findOneTransaction(@Param('id', ParseIntPipe) id: number) {
        const transaction = await this.ppobService.findOneTransaction(id);
        return {
            statusCode: 200,
            message: 'Detail transaksi PPOB berhasil diambil',
            data: transaction
        };
    }

    @Get('transactions/user/:userId')
    async findUserTransactions(
        @Param('userId', ParseIntPipe) userId: number,
        @Query(ValidationPipe) filter: FilterPPOBTransactionDto
    ) {
        const filterWithUser = { ...filter, userId };
        const result = await this.ppobService.findAllTransactions(filterWithUser);
        return {
            statusCode: 200,
            message: 'Data transaksi PPOB user berhasil diambil',
            data: result.data,
            meta: result.meta
        };
    }

    // ========== UTILITY ENDPOINTS ==========
    @Post('check-bill')
    @HttpCode(HttpStatus.OK)
    async checkBill(@Body(ValidationPipe) checkDto: CheckPPOBDto) {
        const result = await this.ppobService.checkBill(checkDto);
        return {
            statusCode: 200,
            message: 'Pengecekan tagihan berhasil',
            data: result
        };
    }

    @Get('stats')
    async getStats() {
        const stats = await this.ppobService.getStats();
        return {
            statusCode: 200,
            message: 'Statistik PPOB berhasil diambil',
            data: stats
        };
    }

    // ========== TRIPAY SYNC ENDPOINT ==========
    @Post('sync-products')
    @HttpCode(HttpStatus.OK)
    async syncProducts(@Query('margin') margin?: string) {
        const marginPercent = margin ? parseFloat(margin) : 5;
        const result = await this.ppobService.syncProductsFromTripay(marginPercent);
        return {
            statusCode: 200,
            message: result.message,
            data: {
                synced: result.synced,
                failed: result.failed
            }
        };
    }

    // ========== CATEGORY ENDPOINTS ==========
    @Get('categories')
    async getCategories() {
        return {
            statusCode: 200,
            message: 'Daftar kategori PPOB berhasil diambil',
            data: [
                { value: 'pulsa', label: 'Pulsa' },
                { value: 'paket_data', label: 'Paket Data' },
                { value: 'pln', label: 'PLN' },
                { value: 'bpjs', label: 'BPJS' },
                { value: 'pdam', label: 'PDAM' },
                { value: 'telkom', label: 'Telkom' },
                { value: 'tv_kabel', label: 'TV Kabel' },
                { value: 'e_wallet', label: 'E-Wallet' },
                { value: 'voucher_game', label: 'Voucher Game' }
            ]
        };
    }

    @Get('providers')
    async getProviders(@Query('kategori') kategori?: string) {
        const providers = {
            pulsa: ['Telkomsel', 'Indosat', 'XL', 'Tri', 'Smartfren', 'Axis'],
            paket_data: ['Telkomsel', 'Indosat', 'XL', 'Tri', 'Smartfren', 'Axis'],
            pln: ['PLN Prepaid', 'PLN Postpaid'],
            bpjs: ['BPJS Kesehatan'],
            pdam: ['PDAM Jakarta', 'PDAM Bandung', 'PDAM Surabaya'],
            telkom: ['Telkom Indihome', 'Telkom Speedy'],
            tv_kabel: ['Indihome TV', 'First Media', 'MNC Vision'],
            e_wallet: ['GoPay', 'OVO', 'Dana', 'ShopeePay', 'LinkAja'],
            voucher_game: ['Mobile Legends', 'Free Fire', 'PUBG', 'Genshin Impact', 'Valorant']
        };

        const data = kategori && providers[kategori]
            ? providers[kategori]
            : Object.values(providers).flat();

        return {
            statusCode: 200,
            message: 'Daftar provider berhasil diambil',
            data
        };
    }
}