import { IsString, IsEmail, IsOptional, MinLength, MaxLength, Matches, IsPhoneNumber, IsDateString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';;

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other'
}

export class CreateUserDto {
    @IsString({ message: 'Nama harus berupa string ' })
    @MinLength(2, { message: 'Nama minimal 2 karakter' })
    @MaxLength(100, { message: 'Nama maksimal 100 karakter' })
    @Transform(({ value }) => value?.toLowerCase().trim())
    nama: string;

    @IsString({ message: 'email harus berupa string ' })
    @MinLength(2, { message: 'Email minimal 2 karakter' })
    @MaxLength(100, { message: 'Email maksimal 100 karakter' })
    @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;


    @IsOptional()
    @IsPhoneNumber('ID', { message: 'Nomor HP harus format 62 ' })
    @Transform(({ value }) => {
        if (!value) return null;
        return value.replace(/^\+?62|^0/, '62');
    })
    no_hp?: string;

    @IsString({ message: 'Password harus berupa string' })
    @MinLength(8, { message: 'Password minimal 8 karakter' })
    @MaxLength(128, { message: 'Password maksimal 128 karakter' })
    @Matches(/^(?=.*[a-z]) (?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: 'Password harus mengandung: huruf besar, huruf kecil, angka, dan simbol'
    })
    password: string;

    @IsString({ message: 'Konfirmasi password harus berupa string' })
    password_confirmation: string;
    @IsOptional()
    @IsString({ message: 'PIN transaksi harus berupa string ' })
    @Matches(/^\d{6}$/, { message: 'PIN transaksi harus berupa 6 digit angka' })
    pin_transaksi?: string;

    @IsOptional()
    @IsDateString({}, { message: 'Format tanggal lahir tidak valid' })
    date_of_birth?: string;

    @IsOptional()
    @IsEnum(Gender, { message: 'Jenis kelamin harus: Laki - laki, perempuan' })
    gender?: Gender;

    @IsOptional()
    @IsString({ message: 'Alamat harus berupa string' })
    @MaxLength(500, { message: 'Alamat maksimal 500 karakter' })
    address?: string;

    @IsOptional()
    @IsString({ message: 'Nomor KTP harus berupa string' })
    @Matches(/^d{16}$/, { message: 'Nomor KTP harus 16 digit angka' })
    ktp_number?: string;


}

export class CreateUserValidationDto extends CreateUserDto {

}