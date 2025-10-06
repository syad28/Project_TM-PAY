import { IsString, IsEmail, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export enum AdminRole {
    SUPER_ADMIN = 'super_admin',
    ADMIN = 'admin',
    MODERATOR = 'moderator'
}

export class CreateAdminDto {
    @IsString({ message: 'Nama harus berupa string' })
    @MinLength(2, { message: 'Nama minimal 2 karakter' })
    @MaxLength(100, { message: 'Nama maksimal 100 karakter' })
    @Transform(({ value }) => value?.trim())
    nama: string;

    @IsEmail({}, { message: 'Format email tidak valid' })
    @MaxLength(255, { message: 'Email maksimal 255 karakter' })
    @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;

    @IsString({ message: 'Password harus berupa string' })
    @MinLength(8, { message: 'Password minimal 8 karakter' })
    @MaxLength(128, { message: 'Password maksimal 128 karakter' })
    password: string;

    @IsString({ message: 'Konfirmasi password harus berupa string' })
    password_confirmation: string;

    @IsOptional()
    @IsEnum(AdminRole, { message: 'Role harus: super_admin,admin, atau moderator' })
    role?: AdminRole;
}

export class AdminLoginDto {
    @IsEmail({}, { message: 'Format email tidak valif' })
    @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;

    @IsString({ message: 'Password harus berupa string' })
    @MinLength(1, { message: 'Password tidak boleh kosong' })
    password: string;
}

export class UpdateAdminDto {
    @IsOptional()
    @IsString({ message: 'Nama harus berupa string' })
    @MinLength(2, { message: 'Nama minimal 2 karakter' })
    @MaxLength(100, { message: 'Nama maksimal 100 karakter' })
    @Transform(({ value }) => value?.trim())
    nama?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Format email tidak valid' })
    @MaxLength(255, { message: 'Email maksimal 255 karakter' })
    @Transform(({ value }) => value?.toLowerCase().trim())
    email?: string;

    @IsOptional()
    @IsEnum(AdminRole, { message: 'Roler harus: super_admin , admin, moderator' })
    role?: AdminRole;
}

export class ChangeAdminPasswordDto {
    @IsString({ message: 'Password lama harus  berupa string' })
    current_password: string;

    @IsString({ message: 'Password baru harus berupa string' })
    @MinLength(8, { message: 'Password minimal 8 karakter' })
    @MaxLength(128, { message: 'Password maksimal 128 karakter' })
    new_password: string;

    @IsString({ message: 'Konfirmasi password harus berupa string' })
    new_password_confirmation: string;
}

export class AdminUserManagementDto {
    @IsOptional()
    @IsEnum(['active', 'blocked', 'inactive'], {
        message: 'Status harus: active, blocked, atau inactive'
    })
    status_akun?: string;

    @IsOptional()
    @IsString({ message: 'Alasan harus berupa string' })
    @MaxLength(500, { message: 'Alasan maksimal 500 karakter' })
    reason?: string;
}

export class AdminAdjustBalanceDto {
    @IsString({ message: 'Amount harus berupa string' })
    amount: string;

    @IsString({ message: 'Alasan harus berupa string' })
    @MinLength(5, { message: 'Alasan minimal 5 karakter' })
    @MaxLength(500, { message: 'Alasan minimal 5 karakter' })
    reason?: string;
}

export interface AdminResponseDto {
    id: number;
    nama: string;
    email: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AdminDashboardStatsDto {
    users: {
        total: number;
        active: number;
        blocked: number;
        newToday: number;
        newThisWeek: number;
        newThisMonth: number;
    };
    transactions: {
        total: number;
        today: number;
        thisWeek: number;
        thisMonth: number;
        totalVolume: number;
        byType: {
            topup: number;
            transfer: number;
            setor: number;
            tarik: number;
        };
    };
    tabungan: {
        total: number;
        active: number;
        completed: number;
        totalTarget: number;
        totalProgress: number;
    };
    financial: {
        totalBalance: number;
        averageBalance: number;
        totalTransactionVolume: number;
    };
    system: {
        pendingVerifications: number;
        reportedIssues: number;
        activeAdmins: number;
    };
}

export interface AdminLogActivityDto {
    id: number;
    adminId: number;
    adminName: string;
    aktivitas: string;
    tanggal: Date;
    details?: any;
}
export interface AdminUserDetailDto {
    id: number;
    nama: string;
    email: string;
    no_hp: string | null;
    saldo: number;
    status_akun: string;
    role: string;
    email_verified: boolean;
    phone_verified: boolean;
    ktp_verified: boolean;
    last_login_at: Date | null;
    createdAt: Date;
    statistics: {
        totalTransactions: number;
        totalTabungan: number;
    };
    recentTransactions: any[];
    recentTabungan: any[];
}

export interface AdminTransactionReportDto {
    period: string;
    summary: {
        totalTransactions: number;
        totalVolume: number;
        averageTransactions: number;
    };
    byType: {
        type: string;
        count: number;
        volume: number;
    }[];
    byDay: {
        data: string;
        count: number;
        volume: number;
    }[];
    topUsers: {
        userId: number;
        userName: string;
        transactionCount: number;
        totalVolume: number;
    }[];
}