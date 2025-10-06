import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Delete,
    Body,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    Request,
    ValidationPipe
} from '@nestjs/common';
import { AdminService } from './admin.service';
import {
    CreateAdminDto,
    UpdateAdminDto,
    ChangeAdminPasswordDto,
    AdminLoginDto,
    AdminUserManagementDto,
    AdminAdjustBalanceDto
} from './dto';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body(ValidationPipe) createAdminDto: CreateAdminDto) {
        const admin = await this.adminService.register(createAdminDto);
        return {
            statusCode: 201,
            message: 'Admin berhasil terdaftar',
            data: admin
        };
    }
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body(ValidationPipe) loginDto: AdminLoginDto) {
        const result = await this.adminService.login(loginDto);
        return {
            statusCCode: 200,
            message: 'Login admin berhasil',
            data: result
        };
    }

    @Get('dashboard/stats')
    async getDashboardStats() {
        const stats = await this.adminService.getDashboard();
        return {
            statusCode: 200,
            message: 'Statistil dashboard berhasil diambil',
        };
    }

    @Get('users/:id')
    async getUserDetail(@Param('id', ParseIntPipe) id: number) {
        const user = await this.adminService.getUserDetail(id);
        return {
            statusCode: 200,
            message: 'Detail user berhasil diambil',
            data: user
        };
    }
    @Post('users/:id/block')
    @HttpCode(HttpStatus.OK)
    async blocUser(
        @Param('id', ParseIntPipe) userId: number,
        @Body() body: { reason?: string },
        @Request() req: any
    ) {
        const adminId = req.user?.sub || 1;
        const result = await this.adminService.blockUser(userId, adminId, body.reason);
        return {
            statusCode: 200,
            message: result.message,
            data: result.user
        };
    }

    @Post('users/:id/unblock')
    @HttpCode(HttpStatus.OK)
    async unblockUser(
        @Param('id', ParseIntPipe) userId: number,
        @Request() req: any
    ) {
        const adminId = req.user?.sub || 1;
        const result = await this.adminService.unblockUser(userId, adminId);
        return {
            statusCode: 200,
            message: result.message,
            data: result.user
        };
    }

    @Post('users/:id/adjust-balance')
    @HttpCode(HttpStatus.CREATED)
    async adjustBalance(
        @Param('id', ParseIntPipe) adjustDto: AdminAdjustBalanceDto,
        @Request() req: any
    ) {
        const adminId = req.user?.sub || 1;
        const userId = req.user?.sub || 1;
        const result = await this.adminService.adjustUserBalance(userId, adminId, adjustDto);
        return {
            statusCode: 200,
            message: result.message,
            data: result
        };
    }

    @Get('transaction/report')
    async getTransactionReport(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        const report = await this.adminService.getTransactionReport(startDate, endDate);
        return {
            statusCode: 200,
            message: 'Laporan transaksi berhasil diambil',
            data: report
        };
    }

    @Get('admins')
    async getAllAdmins() {
        const admins = await this.adminService.findAllAdmins();
        return {
            statusCode: 200,
            message: 'Data admin berhasil diambil',
            data: admins
        };
    }
    @Patch('admins/:id')
    async updateAdmin(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) updateDto: UpdateAdminDto
    ) {
        const admin = await this.adminService.updateAdmin(id, updateDto);
        return {
            statusCode: 200,
            message: 'Admin berhasil diupdate',
            data: admin
        };
    }
    @Patch('change-password')
    async changePassword(
        @Body(ValidationPipe) changePasswordDto: ChangeAdminPasswordDto,
        @Request() req: any
    ) {
        const adminId = req.user?.sub || 1;
        const result = await this.adminService.changePassword(adminId, changePasswordDto);
        return {
            statusCode: 200,
            message: result.message
        };
    }

    @Get('logs')
    async getActivityLogs(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '50'
    ) {
        const result = await this.adminService.getActivityLogs(parseInt(page), parseInt(limit));
        return {
            statusCode: 200,
            message: 'Log aktivitas berhasil diambil',
            data: result.data,
            meta: result.meta
        };
    }
}