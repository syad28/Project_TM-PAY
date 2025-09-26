import { PartialType } from '@nestjs/mapped-types';
import { CreateTransaksiDto } from './create-transaksi.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTransaksiDto {
    @IsOptional()
    @IsString()
    metode?: string;

    @IsOptional()
    @IsString()
    promo?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    keteranganAdmin?: string;
}

export class FilterTransaksiDto {
    @IsOptional()
    @IsString()
    jenis?: string;

    @IsOptional()
    @IsString()
    metode?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    userId?: number;

    @IsOptional()
    tabunganId?: number;

    @IsOptional()
    startDate?: string;

    @IsOptional()
    endDate?: string;

    @IsOptional()
    page?: number;

    @IsOptional()
    limit?: number;
}
