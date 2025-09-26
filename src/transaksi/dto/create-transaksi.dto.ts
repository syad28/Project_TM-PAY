import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

export class CreateTransaksiDto {
    @IsEnum(['setor', 'tarik', 'topup', 'transfer'])
    jenis: 'setor' | 'tarik' | 'topup' | 'transfer'
    @IsNumber()
    @Min(1000, { message: 'Minimal transaksi 1.000' })
    jumlah: number;

    @IsString()
    metode: string;

    @IsOptional()
    @IsString()
    promo?: string;

    @IsNumber()
    userId: number;

    @IsOptional()
    @IsNumber()
    tabunganId?: number;
    @IsOptional()
    @IsNumber()
    userTujuanId?: number;
}


