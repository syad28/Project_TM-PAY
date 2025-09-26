import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards, HttpCode, HttpStatus, } from '@nestjs/common';
import { TransaksiService } from './transaksi.service';
import { CreateTransaksiDto } from './dto/create-transaksi.dto';
import { UpdateTransaksiDto } from './dto/update-transaksi.dto';
import { FilterTransaksiDto } from './dto/update-transaksi.dto';

@Controller('transaksi')

export class TransaksiController {
    constructor(private readonly transaksiService: TransaksiService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createTransaksiDto: CreateTransaksiDto) {
        return {
            statusCode: 201,
            message: 'Transaksi berhasil dibuat',
            data: await this.transaksiService.create(createTransaksiDto),
        };
    }

    @Get()
    async findAll(@Query() filter: FilterTransaksiDto) {
        const result = await this.transaksiService.findAll(filter);
        return {
            statusCode: 200,
            message: 'Data transaksi berhasil diambil',
            data: result.data,
            meta: result.meta,
        };
    }

    @Get('user/:userId')
    async findByUser(
        @Param('userId', ParseIntPipe) userId: number,
        @Query() filter: FilterTransaksiDto
    ) {
        const filterWithUser = { ...filter, userId };
        const result = await this.transaksiService.findAll(filterWithUser);
        return {
            statusCode: 200,
            message: 'Data transaksi user berhasil diambil',
            data: result.data,
            meta: result.meta,
        };
    }

    @Get('stats')
    async getStats(@Query('userId') userId?: string) {
        const userIdInt = userId ? parseInt(userId) : undefined;
        return {
            statusCode: 200,
            message: 'Statistik transaksi berhasil diambil',
            data: await this.transaksiService.getStats(userIdInt),
        };
    }
    @Post('topup')
    @HttpCode(HttpStatus.CREATED)
    async topup(@Body() topupDto: CreateTransaksiDto) {
        const topupData = { ...topupDto, jenis: 'topup' as any };
        return {
            statusCode: 201,
            message: 'Topup berhasil diproses',
            data: await this.transaksiService.create(topupData),
        };
    }

    @Post('transfer')
    @HttpCode(HttpStatus.CREATED)
    async transfer(@Body() transferDto: CreateTransaksiDto) {
        const transferData = { ...transferDto, jenis: 'transfer' as any };
        return {
            statusCode: 201,
            message: 'Transfer berhasil  diproses',
            data: await this.transaksiService.create(transferData),
        };
    }

    @Post('tabungan/setor')
    @HttpCode(HttpStatus.CREATED)
    async setorTabungan(@Body() setorDto: CreateTransaksiDto) {
        const setorData = { ...setorDto, jenis: 'setor' as any };
        return {
            statusCode: 201,
            message: 'Setor tabungan berhasil diproses',
            data: await this.transaksiService.create(setorData),
        };
    }
}
