import { IsString, IsNumber, IsEmail, MinLength, MaxLength, IsEnum, IsOptional, Min, IsArray, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum PPOBProductType {
    PULSA = 'pulsa',
    PAKET_DATA = 'paket_data',
    PLN = 'pln',
    BPJS = 'bpjs',
    PDAM = 'pdam'
}

export enum PPOBStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SUCCESS = 'success',
    FAILED = 'failed',
    REFUNDED = 'refunded'
}


export class CreatePPOBProductDto {
    @IsString({ message: 'Kode produk harus berupa string' })
    @MinLength(3, { message: 'Kode produk minimal 3 karakter' })
    code: string;

    @IsString({ message: 'Nama produk harus berupa string' })
    @MinLength(3, { message: 'Nama produk minimal 3 karakter' })
    name: string;

    @IsEnum(PPOBProductType, { message: 'Tipe produk tidak valid' })
    type: PPOBProductType;

    @IsNumber({}, { message: 'Harga harus berupa angka' })
    @Min(0, { message: 'Harga tidak boleh negatif' })
    price: number;

    @IsNumber({}, { message: 'Biaya admin harus berupa angka' })
    @Min(0, { message: 'Biaya admin tidak boleh negatif' })
    adminFee: number;

    @IsOptional()
    @IsString({ message: 'Deskripsi harus berupa string' })
    description?: string;

    @IsOptional()
    @IsString({ message: 'Provider harus berupa string' })
    provider?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Stock harus berupa angka' })
    @Min(0, { message: 'Stock tidak boleh negatif' })
    stock?: number;

    @IsOptional()
    @IsString({ message: 'Status harus berupa string' })
    status?: string;
}

export class UpdatePPOBProductDto {
    @IsOptional()
    @IsString({ message: 'Nama produk harus berupa string' })
    @MinLength(3, { message: 'Nama produk minimal 3 karakter' })
    name?: string;

    @IsOptional()
    @IsEnum(PPOBProductType, { message: 'Tipe produk tidak valid' })
    type?: PPOBProductType;

    @IsOptional()
    @IsNumber({}, { message: 'Harga harus berupa angka' })
    @Min(0, { message: 'Harga tidak boleh negatif' })
    price?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Biaya admin harus berupa angka' })
    @Min(0, { message: 'Biaya admin tidak boleh negatif' })
    adminFee?: number;

    @IsOptional()
    @IsString({ message: 'Deskripsi harus berupa string' })
    description?: string;

    @IsOptional()
    @IsString({ message: 'Provider harus berupa string' })
    provider?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Stock harus berupa angka' })
    @Min(0, { message: 'Stock tidak boleh negatif' })
    stock?: number;

    @IsOptional()
    @IsString({ message: 'Status harus berupa string' })
    status?: string;
}

export class FilterPPOBProductDto {
    @IsOptional()
    @IsEnum(PPOBProductType, { message: 'Tipe produk tidak valid' })
    type?: PPOBProductType;

    @IsOptional()
    @IsString({ message: 'Search harus berupa string' })
    search?: string;

    @IsOptional()
    @IsString({ message: 'Provider harus berupa string' })
    provider?: string;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber({}, { message: 'Page harus berupa angka' })
    page?: number = 1;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber({}, { message: 'Limit harus berupa angka' })
    limit?: number = 10;
}



export class PurchasePPOBDto {
    @IsEnum(PPOBProductType, { message: 'Tipe produk tidak valid' })
    productType: PPOBProductType;

    @IsString({ message: 'Kode produk harus berupa string' })
    @MinLength(3, { message: 'Kode produk minimal 3 karakter' })
    productCode: string;

    @IsString({ message: 'Nomor tujuan harus berupa string' })
    @MinLength(8, { message: 'Nomor tujuan minimal 8 karakter' })
    @MaxLength(20, { message: 'Nomor tujuan maksimal 20 karakter' })
    target: string;

    @IsNumber({}, { message: 'User ID harus berupa angka' })
    @Transform(({ value }) => Number(value))
    userId: number;

    @IsOptional()
    @IsString({ message: 'Email harus berupa string' })
    @IsEmail({}, { message: 'Format email tidak valid' })
    email?: string;
}

export class InquiryPPOBDto {
    @IsEnum(PPOBProductType, { message: 'Tipe produk tidak valid' })
    productType: PPOBProductType;

    @IsString({ message: 'Nomor tujuan harus berupa string' })
    target: string;
}

export class CheckPPOBStatusDto {
    @IsString({ message: 'Reference ID harus berupa string' })
    referenceId: string;
}

export class FilterPPOBTransactionDto {
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber({}, { message: 'Page harus berupa angka' })
    page?: number = 1;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber({}, { message: 'Limit harus berupa angka' })
    limit?: number = 10;

    @IsOptional()
    @IsEnum(PPOBProductType, { message: 'Tipe produk tidak valid' })
    productType?: PPOBProductType;

    @IsOptional()
    @IsString({ message: 'Status harus berupa string' })
    status?: string;

    @IsOptional()
    @IsString({ message: 'Start date harus berupa string' })
    startDate?: string;

    @IsOptional()
    @IsString({ message: 'End date harus berupa string' })
    endDate?: string;

    @IsOptional()
    @IsString({ message: 'Search harus berupa string' })
    search?: string;
}



export class PurchaseItemDto {
    @IsEnum(PPOBProductType, { message: 'Tipe produk tidak valid' })
    productType: PPOBProductType;

    @IsString({ message: 'Kode produk harus berupa string' })
    @MinLength(3, { message: 'Kode produk minimal 3 karakter' })
    productCode: string;

    @IsString({ message: 'Nomor tujuan harus berupa string' })
    @MinLength(8, { message: 'Nomor tujuan minimal 8 karakter' })
    @MaxLength(20, { message: 'Nomor tujuan maksimal 20 karakter' })
    target: string;
}

export class BulkPurchasePPOBDto {
    @IsNumber({}, { message: 'User ID harus berupa angka' })
    @Transform(({ value }) => Number(value))
    userId: number;

    @IsOptional()
    @IsString({ message: 'Email harus berupa string' })
    @IsEmail({}, { message: 'Format email tidak valid' })
    email?: string;

    @IsArray({ message: 'Purchases harus berupa array' })
    @ValidateNested({ each: true })
    @Type(() => PurchaseItemDto)
    purchases: PurchaseItemDto[];
}



export class AddFavoriteProductDto {
    @IsNumber({}, { message: 'User ID harus berupa angka' })
    @Transform(({ value }) => Number(value))
    userId: number;

    @IsString({ message: 'Kode produk harus berupa string' })
    productCode: string;

    @IsString({ message: 'Nomor tujuan harus berupa string' })
    target: string;

    @IsOptional()
    @IsString({ message: 'Alias harus berupa string' })
    alias?: string;
}



export class CancelTransactionDto {
    @IsString({ message: 'Reference ID harus berupa string' })
    referenceId: string;

    @IsNumber({}, { message: 'User ID harus berupa angka' })
    @Transform(({ value }) => Number(value))
    userId: number;

    @IsOptional()
    @IsString({ message: 'Alasan harus berupa string' })
    reason?: string;
}

export class RetryTransactionDto {
    @IsString({ message: 'Reference ID harus berupa string' })
    referenceId: string;

    @IsNumber({}, { message: 'User ID harus berupa angka' })
    @Transform(({ value }) => Number(value))
    userId: number;
}


export class ExportTransactionDto {
    @IsNumber({}, { message: 'User ID harus berupa angka' })
    @Transform(({ value }) => Number(value))
    userId: number;

    @IsOptional()
    @IsString({ message: 'Start date harus berupa string' })
    startDate?: string;

    @IsOptional()
    @IsString({ message: 'End date harus berupa string' })
    endDate?: string;

    @IsOptional()
    @IsEnum(PPOBProductType, { message: 'Tipe produk tidak valid' })
    productType?: PPOBProductType;

    @IsOptional()
    @IsString({ message: 'Format harus berupa string' })
    format?: 'pdf' | 'excel' | 'csv';
}


export class CreateScheduledTransactionDto {
    @IsNumber({}, { message: 'User ID harus berupa angka' })
    @Transform(({ value }) => Number(value))
    userId: number;

    @IsEnum(PPOBProductType, { message: 'Tipe produk tidak valid' })
    productType: PPOBProductType;

    @IsString({ message: 'Kode produk harus berupa string' })
    productCode: string;

    @IsString({ message: 'Nomor tujuan harus berupa string' })
    target: string;

    @IsString({ message: 'Schedule type harus berupa string' })
    scheduleType: 'daily' | 'weekly' | 'monthly';

    @IsOptional()
    @IsNumber({}, { message: 'Day harus berupa angka' })
    day?: number;

    @IsOptional()
    @IsString({ message: 'Time harus berupa string' })
    time?: string;

    @IsOptional()
    @IsString({ message: 'Email harus berupa string' })
    @IsEmail({}, { message: 'Format email tidak valid' })
    email?: string;
}

export class UpdateScheduledTransactionDto {
    @IsOptional()
    @IsString({ message: 'Schedule type harus berupa string' })
    scheduleType?: 'daily' | 'weekly' | 'monthly';

    @IsOptional()
    @IsNumber({}, { message: 'Day harus berupa angka' })
    day?: number;

    @IsOptional()
    @IsString({ message: 'Time harus berupa string' })
    time?: string;

    @IsOptional()
    @IsString({ message: 'Status harus berupa string' })
    status?: 'active' | 'paused' | 'cancelled';
}


export class ApplyPromoDto {
    @IsString({ message: 'Kode promo harus berupa string' })
    @MinLength(3, { message: 'Kode promo minimal 3 karakter' })
    promoCode: string;

    @IsNumber({}, { message: 'User ID harus berupa angka' })
    @Transform(({ value }) => Number(value))
    userId: number;

    @IsNumber({}, { message: 'Amount harus berupa angka' })
    @Transform(({ value }) => Number(value))
    amount: number;

    @IsEnum(PPOBProductType, { message: 'Tipe produk tidak valid' })
    productType: PPOBProductType;
}

export class PromoResponseDto {
    valid: boolean;
    promoCode: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    maxDiscount?: number;
    finalAmount: number;
    message: string;
}


export class UpdateNotificationPreferenceDto {
    @IsNumber({}, { message: 'User ID harus berupa angka' })
    @Transform(({ value }) => Number(value))
    userId: number;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    emailNotification?: boolean;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    smsNotification?: boolean;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    pushNotification?: boolean;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    transactionSuccess?: boolean;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    transactionFailed?: boolean;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    lowBalance?: boolean;
}

export class GenerateReceiptDto {
    @IsString({ message: 'Reference ID harus berupa string' })
    referenceId: string;

    @IsNumber({}, { message: 'User ID harus berupa angka' })
    @Transform(({ value }) => Number(value))
    userId: number;

    @IsOptional()
    @IsString({ message: 'Format harus berupa string' })
    format?: 'pdf' | 'image';

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    sendEmail?: boolean;
}


export class AdminGetTransactionsDto {
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber({}, { message: 'Page harus berupa angka' })
    page?: number = 1;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber({}, { message: 'Limit harus berupa angka' })
    limit?: number = 20;

    @IsOptional()
    @IsEnum(PPOBProductType, { message: 'Tipe produk tidak valid' })
    productType?: PPOBProductType;

    @IsOptional()
    @IsString({ message: 'Status harus berupa string' })
    status?: string;

    @IsOptional()
    @IsString({ message: 'Start date harus berupa string' })
    startDate?: string;

    @IsOptional()
    @IsString({ message: 'End date harus berupa string' })
    endDate?: string;

    @IsOptional()
    @IsString({ message: 'Search harus berupa string' })
    search?: string;

    @IsOptional()
    @IsString({ message: 'Sort by harus berupa string' })
    sortBy?: string;

    @IsOptional()
    @IsString({ message: 'Sort order harus berupa string' })
    sortOrder?: 'asc' | 'desc';
}

export class AdminUpdateTransactionDto {
    @IsString({ message: 'Reference ID harus berupa string' })
    referenceId: string;

    @IsOptional()
    @IsEnum(PPOBStatus, { message: 'Status tidak valid' })
    status?: PPOBStatus;

    @IsOptional()
    @IsString({ message: 'Message harus berupa string' })
    message?: string;

    @IsOptional()
    @IsString({ message: 'SN harus berupa string' })
    sn?: string;

    @IsOptional()
    @IsString({ message: 'Admin note harus berupa string' })
    adminNote?: string;
}

export class AdminStatsDto {
    totalTransactions: number;
    totalRevenue: number;
    totalProfit: number;
    byType: {
        pulsa: { count: number; revenue: number };
        paket_data: { count: number; revenue: number };
        pln: { count: number; revenue: number };
        bpjs: { count: number; revenue: number };
        pdam: { count: number; revenue: number };
    };
    byStatus: {
        pending: number;
        processing: number;
        success: number;
        failed: number;
        refunded: number;
    };
    successRate: number;
    todayTransactions: number;
    todayRevenue: number;
    monthlyTransactions: number;
    monthlyRevenue: number;
    topProducts: Array<{
        productCode: string;
        productName: string;
        count: number;
        revenue: number;
    }>;
    topUsers: Array<{
        userId: number;
        userName: string;
        count: number;
        totalSpent: number;
    }>;
}


export class ValidateCallbackDto {
    @IsString({ message: 'Signature harus berupa string' })
    signature: string;

    @IsString({ message: 'Payload harus berupa string' })
    payload: string;
}

export class CheckProductAvailabilityDto {
    @IsString({ message: 'Kode produk harus berupa string' })
    productCode: string;

    @IsOptional()
    @IsString({ message: 'Nomor tujuan harus berupa string' })
    target?: string;
}

export class ProductAvailabilityResponseDto {
    available: boolean;
    productCode: string;
    productName: string;
    stock: number;
    price: number;
    message?: string;
    estimatedProcessTime?: string;
}

export class CheckBalanceDto {
    @IsNumber({}, { message: 'User ID harus berupa angka' })
    @Transform(({ value }) => Number(value))
    userId: number;

    @IsNumber({}, { message: 'Amount harus berupa angka' })
    @Transform(({ value }) => Number(value))
    amount: number;
}

export class BalanceCheckResponseDto {
    sufficient: boolean;
    currentBalance: number;
    requiredAmount: number;
    shortfall?: number;
    message: string;
}


export class TransactionSummaryDto {
    @IsNumber({}, { message: 'User ID harus berupa angka' })
    @Transform(({ value }) => Number(value))
    userId: number;

    @IsString({ message: 'Period harus berupa string' })
    period: 'today' | 'week' | 'month' | 'year' | 'custom';

    @IsOptional()
    @IsString({ message: 'Start date harus berupa string' })
    startDate?: string;

    @IsOptional()
    @IsString({ message: 'End date harus berupa string' })
    endDate?: string;
}

export class TransactionSummaryResponseDto {
    period: string;
    totalTransactions: number;
    totalAmount: number;
    successCount: number;
    failedCount: number;
    pendingCount: number;
    byType: {
        [key: string]: {
            count: number;
            amount: number;
        };
    };
    dailyBreakdown?: Array<{
        date: string;
        count: number;
        amount: number;
    }>;
}


export class RequestRefundDto {
    @IsString({ message: 'Reference ID harus berupa string' })
    referenceId: string;

    @IsNumber({}, { message: 'User ID harus berupa angka' })
    @Transform(({ value }) => Number(value))
    userId: number;

    @IsString({ message: 'Reason harus berupa string' })
    @MinLength(10, { message: 'Alasan minimal 10 karakter' })
    reason: string;

    @IsOptional()
    @IsString({ message: 'Bank account harus berupa string' })
    bankAccount?: string;

    @IsOptional()
    @IsString({ message: 'Bank name harus berupa string' })
    bankName?: string;
}

export class RefundResponseDto {
    success: boolean;
    refundId: string;
    referenceId: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected' | 'processed';
    estimatedTime?: string;
    message: string;
}


export class CreateComplaintDto {
    @IsNumber({}, { message: 'User ID harus berupa angka' })
    @Transform(({ value }) => Number(value))
    userId: number;

    @IsString({ message: 'Reference ID harus berupa string' })
    referenceId: string;

    @IsString({ message: 'Subject harus berupa string' })
    @MinLength(5, { message: 'Subject minimal 5 karakter' })
    subject: string;

    @IsString({ message: 'Description harus berupa string' })
    @MinLength(20, { message: 'Deskripsi minimal 20 karakter' })
    description: string;

    @IsOptional()
    @IsString({ message: 'Category harus berupa string' })
    category?: 'transaction_failed' | 'wrong_number' | 'not_received' | 'other';

    @IsOptional()
    @IsArray({ message: 'Attachments harus berupa array' })
    attachments?: string[];
}

export class ComplaintResponseDto {
    ticketId: string;
    referenceId: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    subject: string;
    createdAt: Date;
    estimatedResolution?: string;
    message: string;
}

export class PPOBProductResponseDto {
    code: string;
    name: string;
    type: string;
    price: number;
    adminFee: number;
    totalPrice: number;
    description?: string;
    status: string;
    stock?: number;
    provider?: string;
}

export class PPOBTransactionResponseDto {
    id: number;
    referenceId: string;
    productCode: string;
    productName: string;
    productType: string;
    target: string;
    price: number;
    adminFee: number;
    totalPrice: number;
    status: string;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
    sn?: string;
    message?: string;
    tripayReference?: string;
    tripayStatus?: string;
    email?: string;
}

export class PPOBListResponseDto {
    data: PPOBTransactionResponseDto[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export class PPOBStatsResponseDto {
    totalTransactions: number;
    totalVolume: number;
    byType: {
        pulsa: number;
        paket_data: number;
        pln: number;
        bpjs: number;
        pdam: number;
    };
    successRate: number;
    todayTransactions: number;
    pendingTransactions?: number;
    failedTransactions?: number;
}

export class ApiResponseDto<T = any> {
    success: boolean;
    message: string;
    data?: T;
    meta?: any;
    errors?: any;
}

export class PPOBTransactionDto {
    @IsString({ message: 'Kode harus berupa string' })
    @MinLength(3, { message: 'Kode minimal 3 huruf' })
    productCode: string;

    @IsString({ message: 'Nomor tujuan harus berupa string' })
    @MinLength(8, { message: 'Nomor tujuan minimal 8 angka' })
    @MaxLength(20, { message: 'Maximal nomer tujuan 20' })
    target: string;

    @IsEnum(PPOBProductType, { message: 'Tipe produk tidak valid' })
    productType: PPOBProductType;

    @IsNumber({}, { message: 'user id harus berupa angka' })
    @Transform(({ value }) => Number(value))
    userId: number;

    @IsOptional()
    @IsNumber({}, { message: 'Harga harus berupa angka' })
    @Transform(({ value }) => Number(value))
    amount?: number

    @IsOptional()
    @IsString({ message: 'Email harus berupa karakter' })
    @IsEmail({}, { message: 'Format email tidak valid' })
    email?: string;
}

export class CheckPPOBDto {
    @IsString({ message: 'Kode promo harus berupa string' })
    promo: string;

    @IsEnum(PPOBProductType, { message: 'Tipe produk tidak valid' })
    productType: PPOBProductType;

    @IsString({ message: 'Nomor tujuan harus berupa angka' })
    @MinLength(8, { message: 'Minimal nomor 8 angka' })
    @MaxLength(20, { message: 'Maksimal nomor 20 angka' })
    target: number;

    @IsOptional()
    @IsString({ message: 'Refrence ID harus berupa string' })
    refrenceId?: string;

    @IsString({ message: 'Kode produk harus berupa angka' })
    @MinLength(3, { message: 'Kode produk minimal 3 angka' })
    productCode: string;
}
export class syncProductsFromTripay {
    @IsOptional()
    @IsString({ message: 'Provider harus berupa string' })
    provider?: string;

    @IsOptional()
    @IsEnum(PPOBProductType, { message: 'Tipe produk tidak valid' })
    productType?: PPOBProductType;
}

export class PPOBProductDto {
    @IsString()
    @MinLength(3)
    code: string;


    @IsString()
    name: string;

    @IsString()
    type: string;

    @IsNumber()
    price: number;

    @IsOptional()
    @IsNumber()
    adminFee?: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    provider?: string;

    @IsOptional()
    @IsNumber()
    stock?: number;

    @IsOptional()
    @IsString()
    status?: string;
}