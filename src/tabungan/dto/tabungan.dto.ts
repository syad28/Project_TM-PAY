import { IsString, IsNumber, IsOptional, MinLength, MaxLength, Min, IsDateString, IsEnum } from 'class-validator';
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
    @IsString({ message: 'Deskripsi harus berupa String' })
    @MaxLength(500, { message: 'Deskripsi maksimal 500 karakter' })
    deskripsi?: string;


}

export class UpdateTabunganDto {
    @IsOptional()
    @IsString({ message: 'Nama tabungan harus berupa string' })
    @MinLength(3, { message: 'Nama tabungan minimal 3 karakter' })
    @MaxLength(100, { message: " Nama tabungan maksimal 100 karakter" })
    @Transform(({ value }) => value?.trim())
    nama?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Target harus berupa angka' })
    @Min(10000, { message: 'Target minimal Rp 10.000' })
    @Transform(({ value }) => Number(value))
    target?: number;

    @IsOptional()
    @IsDateString({}, { message: 'Format tanggal deadline harus string' })
    deadline?: string;

    @IsOptional()
    @IsEnum(['active', 'completed', 'cancelled'], {
        message: 'Status harus : active, completed, atau cancelled'
    })
    status?: string;

    @IsOptional()
    @IsString({ message: 'Deskripsi harus berupa string' })
    @MaxLength(500, { message: 'Deskripsi maksimal 500 karakter ' })
    deskripsi?: string;
}

export class SetorTabunganDto {
    @IsEnum({}, { message: 'Jumlah setor harus berupa angka' })
    @Min(1000, { message: 'Minimal setor Rp 1.000' })
    @Transform(({ value }) => Number(value))
    jumlah: number;

    @IsNumber({}, { message: 'Tabungan ID harus berupa angka' })
    @Transform(({ value }) => Number(value))
    tabunganId: number;

    @IsNumber({}, { message: 'User ID harus berupa angka ' })
    @Transform(({ value }) => Number(value))
    userId: number;

    @IsOptional()
    @IsString({ message: 'Metode harus berupa string' })
    metode?: string;
}

export class TarikTabunganDto {
    @IsNumber({}, { message: 'Jmlah tarik harus berupa angka' })
    @Min(1000, { message: 'Jumlah tarik Rp 1.000' })
    @Transform(({ value }) => Number(value))
    jumlah: number;

    @IsNumber()
    @Transform(({ value }) => Number(value))
    tabunganId: number;

    @IsOptional()
    @IsString({ message: 'Metode harus berupa string' })
    metode?: string

    @IsNumber({}, { message: 'User ID harus berupa angka' })
    @Transform(({ value }) => Number(value))
    userId: number;

}

export class FilterTabunganDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(['active', 'completed', 'cancelled'])
    status?: string;

    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    userId?: number;

    @IsOptional()
    @IsString()
    startDate?: string;

    @IsOptional()
    @IsString()
    endDate?: string;

    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    @Min(1)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';
}

export interface TabunganResponseDto {
    id: number;
    nama: string;
    target: number;
    progres: number;
    deadline: Date | null;
    status: string;
    createdAt: Date;
    persentaseProgres: number;
    sisaTarget: number;
    user?: {
        id: number;
        nama: string;
        email: string;
    };
}

export interface TabunganListResponseDto {
    data: TabunganResponseDto[];
    meta: {
        total: number;
        page: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
        limit: number;
    };
}

export interface TabunganStatsResponseDto {
    totalTabungan: number;
    activeTabungan: number;
    completedTabungan: number;
    cancelledTabungan: number;
    totalTargetAmount: number;
    totalProgressAmount: number;
    averageProgress: number;
    nearDeadline: number;
    completionRate: number;
}