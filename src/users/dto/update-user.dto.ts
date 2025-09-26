import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto, Gender } from './create-users-dto';
import {
    IsString,
    IsEmail,
    IsOptional,
    MinLength,
    MaxLength,
    Matches,
    IsPhoneNumber,
    IsDateString,
    IsEnum,
    IsNumber,
    Min,
    Max,
    Length
} from 'class-validator';
import { Transform } from 'class-transformer';
export class UpdateUserProfileDto {
    @IsOptional()
    @IsString({ message: 'Nama harus berupa string' })
    @MinLength(2, { message: 'Nama maksimal 100 karakter' })
    @MaxLength(100, { message: 'Nama maksimal 100 huruf' })
    @Transform(({ value }) => value?.trim())
    nama?: string;

    @IsOptional()
    @IsPhoneNumber('ID', { message: 'Nomor HP harus format 62' })
    @Transform(({ value }) => {
        if (!value) return null;
        return value.replace(/^\+?62| ^0/, '62');
    })
    no_hp?: string;
    @IsOptional()
    @IsDateString({}, { message: 'Format tanggal lahir tidak valid' })
    date_of_birth?: string;

    @IsOptional()
    @IsEnum(Gender, { message: 'Jenis kelamin harus laki-laki, perempuan' })
    gender?: Gender;

    @IsOptional()
    @IsString({ message: 'Alamat harus berupa string' })
    @MaxLength(500, { message: 'Alamat maksimal 500 karakter' })
    address?: string;

    @IsOptional()
    @IsString({ message: 'URL avatar harus berupa string' })
    @MaxLength(1000, { message: 'URL avatar maksimal 1000 karakter' })
    avatar_url?: string
}

export class ChangePasswordDto {
    @IsString({ message: 'Password lama harus berupa string' })
    current_password: string;

    @IsString({ message: 'Password baru harus berupa string' })
    @MinLength(8, { message: 'Password minimal 8 karakter' })
    @MaxLength(128, { message: 'Password maksimal 128 karakter' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@!%*?&]/, {
        message: 'Password harus mengandung: huruf besar, huruf kecil,angka,dan simbol'
    })
    new_password: string;

    @IsString({ message: 'Konfirmasi password harus berupa string' })
    new_password_confirmation: string;
}

export class ChangePinDto {
    @IsOptional()
    @IsString({ message: 'PIN lama harus berupa string' })
    @Matches(/^\d{6}$/, { message: 'PIN lama harus 6 digit angka' })
    current_pin?: string;


    @IsString()
    @Length(6, 6, { message: 'PIN baru Harus 6 digit' })
    @Matches(/^ [0 - 9] + $ /, { message: 'PIN baru hanya boleh berisi angka' })
    new_pin: string;

    @IsString({ message: 'PIN baru harus berupa string' })
    @Matches(/^ [0 - 9] + $ /, { message: 'Konfirmasi PIN harus 6 digit angka' })
    new_pin_confirmation: string;


    rest?: any;
}

export class AdminUpdateUserDto extends UpdateUserProfileDto {
    @IsOptional()
    @IsEmail({}, { message: 'Format email tidak valid' })
    @MaxLength(255, { message: 'Email maksimal 255 karakter' })
    @Transform(({ value }) => value?.toLowerCase().trim())
    email?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Saldo harus berupa angka' })
    @Min(0, { message: 'Saldo maksimal 10.000.000' })
    saldo?: number;

    @IsOptional()
    @IsEnum(['active', 'bloced', 'inactive'], {
        message: 'Status akun harus: active, blocked, atau inactive'
    })
    status_akun?: string;
    @IsOptional()
    @IsString({ message: 'Role harus berupa string' })
    @MaxLength(50, { message: 'Role maksimal 50 karakter' })
    role?: string;

    keterangan?: string;
}

export class FilterUserDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(['active', 'blocked', 'inactive'])
    status_akun?: string;

    @IsOptional()
    @IsString()
    role?: string;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsString()
    verified?: string;

    @IsOptional()
    @IsString()
    startDate?: string;

    @IsOptional()
    @IsString()
    endDate?: string;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    page?: number;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';
}