import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEmail, Min } from 'class-validator';

export class BaseDto {
    @IsOptional()
    @IsNumber()
    id?: number;

    @IsOptional()
    @IsString()
    nama?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    saldo?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    target?: number;

    @IsOptional()
    @IsString()
    progres: number;

    @IsOptional()
    @IsString()
    metode?: string;

    @IsOptional()
    @IsString()
    promo?: string;

    @IsOptional()
    @IsString()
    jenis?: string;

    @IsOptional()
    deadline?: Date;

    @IsOptional()
    status?: string;

    @IsOptional()
    createdAt?: Date;


}