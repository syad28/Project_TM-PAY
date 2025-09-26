import { IsString, IsNumber, IsOptional, MinLength, MaxLength, Min, IsDateString } from 'class-validator'
import { Transform } from 'class-transformer';

export class CreateTabunganDto {

    @IsString({ message: 'Nama tabungan harus berupa string' })
    @MinLength(3, { message: 'Nama tabungan minimal 3 karakter' })
    @MaxLength(100, { message: 'Nama tabugan maksimak 100 karakter' })
    @Transform(({ value }) => value?.trim())
    nama: string

    @IsNumber({}, { message: 'Target harus berupa angka' })
    @Min(10000, { message: 'Target minimal Rp. 10.000' })
    @Transform(({ value }) => Number(value))
    target: number;

    @IsOptional()
    @IsDateString({}, { message: 'Format tanggal deadline tidak valid' })
    deadline?: number;

    @IsNumber({}, { message: 'User ID harus berupa angka' })
    @Transform(({ value }) => Number(value))
    userId: number;

    @IsOptional()
    @IsString({ message: 'Deskreipsi harus berupa String' })
    @MaxLength(500, { message: 'Deskripsi maksimal 500 karakter' })
    deskripsi?: string;


}