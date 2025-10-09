# PPOB DTOs Documentation

File ini berisi semua Data Transfer Objects (DTOs) untuk module PPOB dengan validasi lengkap menggunakan `class-validator`.

## 📋 Daftar Isi

1. [Enums](#enums)
2. [Request DTOs](#request-dtos)
3. [Query DTOs](#query-dtos)
4. [Response DTOs](#response-dtos)
5. [Advanced Features](#advanced-features)
6. [Admin DTOs](#admin-dtos)
7. [Validation Rules](#validation-rules)

---

## 🏷️ Enums

### PPOBProductType
Tipe produk PPOB yang tersedia:
```typescript
enum PPOBProductType {
  PULSA = 'pulsa',
  PAKET_DATA = 'paket_data',
  PLN = 'pln',
  BPJS = 'bpjs',
  PDAM = 'pdam'
}
```

### PPOBStatus
Status transaksi PPOB:
```typescript
enum PPOBStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}
```

---

## 📥 Request DTOs

### 1. PurchasePPOBDto
Untuk melakukan pembelian produk PPOB.

**Fields:**
- `productType` (required): Tipe produk (enum)
- `productCode` (required): Kode produk (min 3 karakter)
- `target` (required): Nomor tujuan (8-20 karakter)
- `userId` (required): ID user (number)
- `email` (optional): Email untuk notifikasi

**Example:**
```json
{
  "productType": "pulsa",
  "productCode": "TELKOMSEL10",
  "target": "081234567890",
  "userId": 1,
  "email": "user@example.com"
}
```

**Validation:**
- ✅ Product type harus valid enum
- ✅ Product code minimal 3 karakter
- ✅ Target 8-20 karakter
- ✅ User ID harus number
- ✅ Email harus format valid (jika diisi)

---

### 2. InquiryPPOBDto
Untuk inquiry/cek produk sebelum membeli.

**Fields:**
- `productType` (required): Tipe produk
- `target` (required): Nomor tujuan

**Example:**
```json
{
  "productType": "pulsa",
  "target": "081234567890"
}
```

---

### 3. CheckPPOBStatusDto
Untuk mengecek status transaksi.

**Fields:**
- `referenceId` (required): Reference ID transaksi

**Example:**
```json
{
  "referenceId": "PPOB1234567890"
}
```

---

## 🔍 Query DTOs

### 1. GetProductsQueryDto
Query parameters untuk get products.

**Fields:**
- `type` (optional): Filter by product type
- `search` (optional): Search keyword
- `provider` (optional): Filter by provider

**Example:**
```
GET /ppob/products?type=pulsa&search=telkomsel&provider=telkomsel
```

---

### 2. GetHistoryQueryDto
Query parameters untuk get transaction history.

**Fields:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page
- `productType` (optional): Filter by product type
- `status` (optional): Filter by status

**Example:**
```
GET /ppob/history/1?page=1&limit=10&productType=pulsa&status=success
```

---

## 📤 Response DTOs

### 1. PPOBProductResponseDto
Response untuk data produk.

**Fields:**
```typescript
{
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
```

---

### 2. PPOBTransactionResponseDto
Response untuk data transaksi.

**Fields:**
```typescript
{
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
```

---

### 3. PPOBListResponseDto
Response untuk list transaksi dengan pagination.

**Structure:**
```typescript
{
  data: PPOBTransactionResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

---

### 4. PPOBStatsResponseDto
Response untuk statistik transaksi.

**Fields:**
```typescript
{
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
```

---

## 🚀 Advanced Features

### 1. Bulk Purchase
Untuk membeli multiple produk sekaligus.

**BulkPurchasePPOBDto:**
```json
{
  "userId": 1,
  "email": "user@example.com",
  "purchases": [
    {
      "productType": "pulsa",
      "productCode": "TELKOMSEL10",
      "target": "081234567890"
    },
    {
      "productType": "pulsa",
      "productCode": "XL10",
      "target": "087654321098"
    }
  ]
}
```

---

### 2. Favorite Product
Simpan produk favorit untuk pembelian cepat.

**AddFavoriteProductDto:**
```json
{
  "userId": 1,
  "productCode": "TELKOMSEL10",
  "target": "081234567890",
  "alias": "Pulsa Mama"
}
```

---

### 3. Scheduled Transaction
Jadwalkan transaksi otomatis (auto-recharge).

**CreateScheduledTransactionDto:**
```json
{
  "userId": 1,
  "productType": "pulsa",
  "productCode": "TELKOMSEL10",
  "target": "081234567890",
  "scheduleType": "monthly",
  "day": 1,
  "time": "08:00",
  "email": "user@example.com"
}
```

**Schedule Types:**
- `daily` - Setiap hari
- `weekly` - Setiap minggu (day: 1-7, 1=Senin)
- `monthly` - Setiap bulan (day: 1-31)

---

### 4. Promo/Voucher
Apply promo code untuk discount.

**ApplyPromoDto:**
```json
{
  "promoCode": "DISKON10",
  "userId": 1,
  "amount": 10000,
  "productType": "pulsa"
}
```

**PromoResponseDto:**
```json
{
  "valid": true,
  "promoCode": "DISKON10",
  "discountType": "percentage",
  "discountValue": 10,
  "maxDiscount": 5000,
  "finalAmount": 9000,
  "message": "Promo berhasil diterapkan"
}
```

---

### 5. Transaction Management

**Cancel Transaction:**
```json
{
  "referenceId": "PPOB1234567890",
  "userId": 1,
  "reason": "Salah nomor tujuan"
}
```

**Retry Transaction:**
```json
{
  "referenceId": "PPOB1234567890",
  "userId": 1
}
```

---

### 6. Export & Report

**ExportTransactionDto:**
```json
{
  "userId": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "productType": "pulsa",
  "format": "pdf"
}
```

**Formats:**
- `pdf` - PDF document
- `excel` - Excel spreadsheet
- `csv` - CSV file

---

### 7. Receipt Generation

**GenerateReceiptDto:**
```json
{
  "referenceId": "PPOB1234567890",
  "userId": 1,
  "format": "pdf",
  "sendEmail": true
}
```

---

### 8. Refund Request

**RequestRefundDto:**
```json
{
  "referenceId": "PPOB1234567890",
  "userId": 1,
  "reason": "Pulsa tidak masuk setelah 24 jam",
  "bankAccount": "1234567890",
  "bankName": "BCA"
}
```

---

### 9. Complaint/Support Ticket

**CreateComplaintDto:**
```json
{
  "userId": 1,
  "referenceId": "PPOB1234567890",
  "subject": "Pulsa tidak masuk",
  "description": "Saya sudah melakukan pembelian pulsa 10.000 untuk nomor 081234567890 tetapi pulsa belum masuk sampai sekarang",
  "category": "not_received",
  "attachments": [
    "https://example.com/screenshot1.jpg"
  ]
}
```

**Categories:**
- `transaction_failed` - Transaksi gagal
- `wrong_number` - Salah nomor
- `not_received` - Belum diterima
- `other` - Lainnya

---

## 👨‍💼 Admin DTOs

### 1. AdminGetTransactionsDto
Query untuk admin melihat semua transaksi.

**Fields:**
```typescript
{
  page?: number;
  limit?: number;
  productType?: PPOBProductType;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

**Example:**
```
GET /admin/ppob/transactions?page=1&limit=20&status=success&startDate=2024-01-01&sortBy=created_at&sortOrder=desc
```

---

### 2. AdminUpdateTransactionDto
Update transaksi oleh admin.

**Fields:**
```json
{
  "referenceId": "PPOB1234567890",
  "status": "success",
  "message": "Transaksi berhasil diproses manual",
  "sn": "SN1234567890",
  "adminNote": "Diproses manual karena callback gagal"
}
```

---

### 3. AdminStatsDto
Statistik lengkap untuk admin dashboard.

**Response:**
```typescript
{
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
```

---

## ✅ Validation Rules

### String Validations
- `@IsString()` - Harus string
- `@MinLength(n)` - Minimal n karakter
- `@MaxLength(n)` - Maksimal n karakter
- `@IsEmail()` - Format email valid

### Number Validations
- `@IsNumber()` - Harus number
- `@Min(n)` - Minimal n
- `@Transform()` - Convert string to number

### Enum Validations
- `@IsEnum(EnumType)` - Harus salah satu nilai enum

### Optional Fields
- `@IsOptional()` - Field boleh kosong

### Array Validations
- `@IsArray()` - Harus array
- `@ValidateNested()` - Validasi nested objects
- `@Type()` - Transform to class type

---

## 🎯 Usage Examples

### Basic Purchase
```typescript
const purchaseDto: PurchasePPOBDto = {
  productType: PPOBProductType.PULSA,
  productCode: 'TELKOMSEL10',
  target: '081234567890',
  userId: 1,
  email: 'user@example.com'
};
```

### With Validation
```typescript
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

const dto = plainToClass(PurchasePPOBDto, requestBody);
const errors = await validate(dto);

if (errors.length > 0) {
  // Handle validation errors
  console.log(errors);
}
```

### Query Parameters
```typescript
const query: GetHistoryQueryDto = {
  page: 1,
  limit: 10,
  productType: PPOBProductType.PULSA,
  status: 'success'
};
```

---

## 📝 Notes

1. **Semua DTO sudah dilengkapi dengan validation decorators**
2. **Transform decorators** digunakan untuk convert tipe data
3. **Optional fields** menggunakan `@IsOptional()`
4. **Nested objects** menggunakan `@ValidateNested()` dan `@Type()`
5. **Error messages** sudah dalam Bahasa Indonesia

---

## 🔄 Updates

**Version 1.0.0** (Current)
- ✅ Basic PPOB operations
- ✅ Bulk purchase
- ✅ Scheduled transactions
- ✅ Promo/voucher
- ✅ Export & report
- ✅ Refund & complaint
- ✅ Admin features

**Planned Features:**
- [ ] Multi-language error messages
- [ ] Custom validation decorators
- [ ] Auto-complete suggestions
- [ ] Rate limiting DTOs

---

**Created by:** T-MPay Development Team  
**Last Updated:** January 2024
