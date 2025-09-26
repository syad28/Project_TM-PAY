import { IsString, IsEmail, MinLength, IsOptional, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
    @IsEmail({}, { message: 'Format email tidak valid' })
    @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;

    @IsString({ message: 'Password harus berupa string' })
    @MinLength(1, { message: 'Password tidak boleh kosong' })
    password: string;

    @IsOptional()
    @IsString({ message: 'Device info harus berupa string' })
    device_info?: string;

    @IsOptional()
    @IsString({ message: 'Remember me harus berupa string' })
    remember_me?: boolean;
}

export class RefreshTokenDto {
    @IsString({ message: 'Refresh token harus berupa string' })
    refresh_token: string;
}
export class ForgotPasswordDto {
    @IsEmail({}, { message: 'Format email tidak valif' })
    @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;
}
export class ResetPasswordDto {
    @IsString({ message: 'Token reset harus berupa string' })
    token: string;

    @IsString({ message: 'Password baru harus berupa string' })
    @MinLength(8, { message: 'Password minimal 8 karakter' })
    new_password: string;

    @IsString({ message: 'Konfirmasi password harus berupa string' })
    new_password_confirmation: string;
}

export class VerifyEmailDto {
    @IsString({ message: 'Token vertidikasi harus berupa string' })
    token: string;
}
export class VerifyPhoneDto {

    @IsString({ message: 'Kode OTP harus berupa string' })
    @Matches(/^\d{6}$/, { message: 'Kode OTP harus 6 digit angka' })
    otp_code: string;
}
export class ResendVerificationDto {
    @IsString({ message: 'Tipe verifikasi harus  berupa string' })
    @Matches(/^(email|phone)$/, { message: 'Tipe harus email atau phone' })
    type: 'email' | 'phone';
}

export class ValidatePinDto {
    @IsString({ message: 'PIN transaksi harus berupa string' })
    @Matches(/^\{6}$/, { message: 'PIN transaksi harus 6 digit' })
    pin: string;
}

export class ValidationPinDto extends ValidatePinDto { }