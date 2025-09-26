import {
    Controller, Get, Post, Body,
    Patch, Param, Delete, Query, ParseIntPipe, HttpCode, HttpStatus, Request, Headers, ValidationPipe, Ip, NotFoundException, BadRequestException
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
    CreateUserDto,
    UpdateUserProfileDto,
    ChangePasswordDto,
    ChangePinDto,
    AdminUpdateUserDto,
    FilterUserDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    VerifyEmailDto,
    VerifyPhoneDto,
    ResendVerificationDto,
    ValidationPinDto,
    RefreshTokenDto,
    LoginDto
} from './dto';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';
// import { Public } from '../auth/public.decorator';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(
        @Body(new ValidationPipe({ transform: true })) createUserDto: CreateUserDto
    ) {
        const user = await this.usersService.register(createUserDto);
        return {
            statusCode: 201,
            message: 'Register berhasil, silahkan verifikasi email anda',
            data: user,
            verification_required: true
        };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body(ValidationPipe) loginDto: LoginDto,
        @Ip() ipAddress: string,
        @Headers('user-agent') userAgent: string
    ) {
        const result = await this.usersService.login(loginDto, ipAddress, userAgent);
        return {
            statusCode: 200,
            message: 'Login berhasil',
            data: result
        };
    }
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Request() req: any) {
        const token = req.headers.authorization?.replace('Bearer', '');
        const userId = req.user.sub;

        const result = await this.usersService.logout(userId, token);
        return {
            statusCode: 200,
            message: result.message
        };
    }
    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return {
            statusCode: 200,
            message: 'Token refreshed succesfully'
        };
    }
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return {
            statusCode: 200,
            message: 'Email reset password telah dikirim'
        };
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return {
            statusCode: 200,
            message: 'Password berhasil direset'
        };
    }


    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
        return {
            statusCode: 200,
            message: 'Email berhasil diverifikasi'
        };
    }

    @Post('verify-phone')
    @HttpCode(HttpStatus.OK)
    async verifyPhone(@Body() verifyPhoneDto: VerifyPhoneDto, @Request() req: any) {
        return {
            statusCode: 200,
            message: 'Nomor HP berhasil diverifikasi'
        };
    }

    @Post('resend-verification')
    @HttpCode(HttpStatus.OK)
    async resendVerification(
        @Body() resendDto: ResendVerificationDto,
        @Request() req: any
    ) {
        return {
            statusCode: 200,
            message: `Kode verifikasi ${resendDto.type} telah dikirim ulang`
        };
    }

    @Get('profile')
    async getProfile(@Request() req: any) {
        const userId = req.user?.sub || 1;
        const user = await this.usersService.findOne(userId);
        return {
            statusCode: 200,
            message: 'Profile berhasil diambil',
            data: user
        };
    }

    @Patch('profile')
    async updateProfile(
        @Body(new ValidationPipe({ transform: true })) updateUserDto: UpdateUserProfileDto,
        @Request() req: any
    ) {
        const userId = req.user?.sub || 1;
        const user = await this.usersService.updateProfile(userId, updateUserDto);
        return {
            statusCode: 200,
            message: 'Profile berhasil diupdate',
            data: user
        };
    }

    @Patch('change-password')
    async changePassword(
        @Body(new ValidationPipe({ transform: true })) changePasswordDto: ChangePasswordDto,
        @Request() req: any
    ) {
        const userId = req.user?.sub || 1;
        const result = await this.usersService.changePassword(userId, changePasswordDto);
        return {
            statusCode: 200,
            message: result.message
        };
    }

    @Patch('change-pin')
    async changePin(
        @Body(new ValidationPipe({ transform: true })) changePinDto: ChangePinDto,
        @Request() req: any
    ) {
        const userId = req.user?.sub || 1;
        const result = await this.usersService.changePin(userId, changePinDto);
        return {
            statusCode: 200,
            message: result.message
        };
    }

    @Post('validate-pin')
    @HttpCode(HttpStatus.OK)
    async validatePin(
        @Body(ValidationPipe) changePinDto: ChangePinDto,
        @Request() req: any
    ) {
        const userId = req.user?.sub || 1;
        const isValid = await this.usersService.changePin(userId, changePinDto);
        return {
            statusCode: 200,
            message: isValid ? 'PIN valid' : 'PIN tidak valid',
            data: { valid: isValid }
        };
    }

    @Get()
    async findAll(@Query(new ValidationPipe({ transform: true })) filter: FilterUserDto) {
        const result = await this.usersService.findAll(filter);
        return {
            statusCode: 200,
            message: 'Data user berhasil diambil',
            data: result.data,
            meta: result.meta
        };
    }

    @Get('stats')
    async getStats() {
        const stats = await this.usersService.getStats();
        return {
            statusCode: 200,
            message: 'Statistik user berhasil diambil',
            data: stats
        };
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const user = await this.usersService.findOne(id);
        return {
            statusCode: 200,
            message: 'Data user berhasil diambil',
            data: user
        };
    }

    // sesi admin cuy

    @Patch(':id/admin-update')
    async adminUpdateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body(new ValidationPipe({ transform: true })) updateDto: AdminUpdateUserDto
    ) {
        const user = await this.usersService.adminUpdateUser(id, updateDto);
        return {
            statusCode: 200,
            message: 'User berhasil diupdate oleh admin',
            data: user
        };
    }

    @Patch(':id/block')
    async blockUser(@Param('id', ParseIntPipe) id: number) {
        const user = await this.usersService.adminUpdateUser(id, { status_akun: 'blocked' });
        return {
            statusCode: 200,
            message: 'User berhasil diblokir',
            data: user
        };
    }

    @Patch(':id/unblock')
    async unblockUser(@Param('id', ParseIntPipe) id: number) {
        const user = await this.usersService.adminUpdateUser(id, { status_akun: 'active' });
        return {
            statusCode: 200,
            message: 'User berhasil dibuka blokir',
            data: user
        };
    }

    @Patch(':id/adjust-balance')
    async adjustBalance(
        @Param('id', ParseIntPipe) id: number,
        @Body('amount', ParseIntPipe) amount: number,
        @Body('reason') reason?: string
    ) {
        const currentUser = await this.usersService.findOne(id);

        if (!currentUser) {
            throw new NotFoundException('User tidak ditemukan');
        }
        const currentBalance = Number(currentUser.saldo) || 0;
        const newBalance = currentBalance + amount;

        if (newBalance < 0) {
            throw new BadRequestException('Saldo tidak mencukupi');
        }
        const dataToUpdate = {
            saldo: newBalance,
            keterangan: reason || `Penyesuaian saldo ${amount > 0 ? 'Penambahan' : 'Pengurangan'}`
        }
        const updateData = await this.usersService.adminUpdateUser(id, dataToUpdate);

        return {
            statusCode: HttpStatus.OK,
            message: `Saldo berhasil ${amount > 0 ? 'ditambah' : 'dikurangi'}`,
            data: updateData
        };
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        const result = await this.usersService.softDelete(id);
        return {
            statusCode: 200,
            message: result.message
        };
    }

    @Get(':id/activities')
    async getUserActivities(
        @Param('id', ParseIntPipe) id: number,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        return {
            statusCode: 200,
            message: 'Aktivitas user berhasil diambil',
            data: [],
            meta: {
                total: 0,
                page,
                limit,
                totalPages: 0
            }
        };
    }

    @Get(':id/sessions')
    async getUserSessions(@Param('id', ParseIntPipe) id: number) {
        return {
            statusCode: 200,
            message: 'Sesi user berhasil diambil',
            data: []
        };
    }

    @Delete(':id/sessions/:sessionId')

    async revokeSession(
        @Param('id', ParseIntPipe) id: number,
        @Param('sessionId') sessionId: string
    ) {

        return {
            statusCode: 200,
            message: 'Sesi berhasil dicabut'
        };
    }

    @Post('bulk-import')
    async bulkImport(@Body() users: CreateUserDto[]) {
        return {
            statusCode: 200,
            message: `${users.length} user berhasil diimport`,
            data: { imported: users.length, failed: 0 }
        };
    }

    @Post('bulk-export')
    async bulkExport(@Body() filter: FilterUserDto) {
        return {
            statusCode: 200,
            message: 'Export user berhasil',
            data: { download_url: 'https://example.com/export.csv' }
        };
    }

}