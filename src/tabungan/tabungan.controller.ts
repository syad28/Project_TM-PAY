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
    Request,
    ValidationPipe
} from '@nestjs/common';
import { TabunganService } from './tabungan.service';
import {
    CreateTabunganDto,
    UpdateTabunganDto,
    SetorTabunganDto,
    TarikTabunganDto,
    FilterTabunganDto,
} from './dto';

@Controller('tabungan')
export class TabunganController {
    constructor(private readonly tabunganService: TabunganService) { }

    // CRUD 
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body(ValidationPipe) createTabunganDto: CreateTabunganDto) {
        const tabungan = await this.tabunganService.create(createTabunganDto);
        return {
            statusCode: 201,
            message: 'Tabungan berhasil dibuat',
            data: tabungan
        };
    }

    @Get()
    async findAll(@Query(ValidationPipe) filter: FilterTabunganDto) {
        const result = await this.tabunganService.findAll(filter);
        return {
            statusCode: 200,
            message: 'Data tabungan berhasil diambil',
            data: result.data,
            meta: result.meta
        };
    }

    @Get('stats')
    async getStats(@Query('userId') userId?: string) {

        const userIdInt = userId ? parseInt(userId) : undefined;
        const stats = await this.tabunganService.getStats(userIdInt);
        return {
            statusCode: 200,
            message: 'Statistik tabungan berhasil diambil',
            data: stats
        };
    }

    @Get('user/:userId')
    async findByUser(
        @Param('userId', ParseIntPipe) userId: number,
        @Query(ValidationPipe) filter: FilterTabunganDto
    ) {
        const filterWithUser = { ...filter, userId };
        const result = await this.tabunganService.findAll(filterWithUser);
        return {
            statusCode: 200,
            message: 'Data tabungan user berhasil ditarik',
            data: result.data,
            meta: result.meta
        };
    }
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const tabungan = await this.tabunganService.findOne(id);
        return {
            statusCode: 200,
            message: 'Detail tabungan berhasil diambil',
            data: tabungan
        };
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) updateTabunganDto: UpdateTabunganDto
    ) {
        const tabungan = await this.tabunganService.update(id, updateTabunganDto);
        return {
            statusCode: 200,
            message: 'Tabungan berhasil diupdate',
            data: tabungan
        };
    }

    @Delete(':id')
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @Query('userId') userId?: string
    ) {
        const userIdInt = userId ? parseInt(userId) : undefined;
        const result = await this.tabunganService.remove(id, userIdInt);
        return {
            statusCode: 200,
            message: result.message
        };
    }

    @Post('setor')
    @HttpCode(HttpStatus.CREATED)
    async setorTabungan(@Body(ValidationPipe) setorDto: SetorTabunganDto) {
        const result = await this.tabunganService.setorTabungan(setorDto);
        return {
            statusCode: 201,
            message: result.message,
            data: result.tabungan
        };
    }

    @Post('tarik')
    @HttpCode(HttpStatus.CREATED)
    async tarikTabungan(@Body(ValidationPipe) tarikDto: TarikTabunganDto) {
        const result = await this.tabunganService.tarikTabungan(tarikDto);
        return {
            statusCode: 201,
            message: result.message,
            data: result.tabungan
        };
    }

    @Get(':id/progress')
    async getProgres(@Param('id', ParseIntPipe) id: number) {
        const tabungan = await this.tabunganService.findOne(id);
        return {
            statusCode: 200,
            message: 'Progress tabungan berhasil diambil',
            data: {
                id: tabungan.id,
                nama: tabungan.nama,
                target: tabungan.target,
                progres: tabungan.progres,
                persentaseProgres: tabungan.persentaseProgres,
                sisaTarget: tabungan.sisaTarget,
                status: tabungan.status,
                deadline: tabungan.deadline
            }
        };
    }

    @Patch(':id/complete')
    async completeTabungan(@Param('id', ParseIntPipe) id: number) {
        const tabungan = await this.tabunganService.update(id, { status: 'completed' });
        return {
            statusCode: 200,
            message: 'Tabungan berhasil diselesaikan',
            data: tabungan
        };
    }

    @Patch(':id/cancel')
    async cancelTabungan(@Param('id', ParseIntPipe) id: number) {
        const tabungan = await this.tabunganService.update(id, { status: 'cancelled' });
        return {
            statusCode: 200,
            message: 'Tabungan berhasil di batalkan',
            data: tabungan
        };
    }
}