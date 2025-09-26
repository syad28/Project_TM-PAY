import { Exclude, Expose, Transform } from 'class-transformer';
import { Decimal } from 'generated/prisma/runtime/library';

export class UserResponseDto {
    @Expose()
    id: number;

    @Expose()
    email: string;

    @Expose()
    @Transform(({ value }) => value ? `+62${value.substring(2)}` : null)
    no_hp: string | null;

    @Expose()
    email_verified: boolean;

    @Expose()
    phone_verifed: boolean;

    @Expose()
    avatar_url: string | null;

    @Expose()
    createdAt: Date;

    @Exclude()
    password: string;

    @Exclude()
    pin_transaksi: string;

    @Exclude()
    ktp_number: string;

    @Exclude()
    failed_login_attempts: number;

    @Exclude()
    locked_until: Date | null;

    @Exclude()
    deletedAt: Date;

    @Exclude()
    nama: string;

    @Expose()
    @Transform(({ value }) => value ? Number(value) : 0)
    saldo: number;

}

export class UserProfileResponseDto extends UserResponseDto {


    @Expose()
    role: string;

    @Expose()
    date_of_birth: Date | null;

    @Expose()
    gender: string | null;

    @Expose()
    address: string | null;

    @Expose()
    ktp_verified: boolean;

    @Expose()
    last_login_at: Date | null;

    @Expose()
    updatedAt: Date;
}

export class UsersAdminResponseDto extends UserProfileResponseDto {

    @Expose()
    password_changed_at: Date | null;

    @Expose()
    email_verified_at: Date | null;

    @Expose()
    phone_verified_at: Date | null;
}

export class UserListResponseDto {
    @Expose()
    data: UserResponseDto[];

    @Expose()
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export class UserStatsResponseDto {
    @Expose()
    totalUsers: number;

    @Expose()
    activeUsers: number;

    @Expose()
    blockedUsers: number;

    @Expose()
    verifiedUsers: number;

    @Expose()
    newUsersThisMonth: number;

    @Expose()
    @Transform(({ value }) => Number(value) || 0)
    totalBalance: number;

    @Expose()
    @Transform(({ value }) => Number(value) || 0)
    averageBalance: number;

    @Expose()
    newUserToday: number;

    @Expose()
    loginToday: number;

    @Expose()
    transactionToday: number;

    @Expose()
    TotalTransactions: number;
}

export class LoginResponseDto {
    @Expose()
    access_token: string;

    @Expose()
    refresh_token: string;

    @Expose()
    expires_in: number;

    @Expose()
    token_type: string;

    @Expose()
    user: UserProfileResponseDto;
}

export class RegisterResponseDto {

    @Expose()
    message: string;

    @Expose()
    user: UserResponseDto;

    @Expose()
    verification_required: boolean;
}