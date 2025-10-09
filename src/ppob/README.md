# PPOB Module - Integrasi Tripay Sandbox

Module PPOB (Payment Point Online Bank) untuk transaksi pulsa, paket data, PLN, BPJS, dan PDAM menggunakan Tripay API Sandbox.

## 📋 Fitur

- ✅ Get list produk PPOB dari Tripay
- ✅ Inquiry produk (cek harga dan ketersediaan)
- ✅ Purchase produk PPOB
- ✅ Check status transaksi
- ✅ Transaction history dengan pagination
- ✅ Statistics transaksi per user
- ✅ Callback handler dari Tripay
- ✅ Integrasi dengan saldo user
- ✅ Auto refund jika transaksi gagal

## 🚀 Setup

### 1. Environment Variables

Pastikan file `.env` sudah berisi konfigurasi Tripay:

```env
# TRIPAY CONFIG
TRIPAY_API_KEY="your-tripay-api-key-here"
TRIPAY_PRIVATE_KEY="your-tripay-private-key-here"
TRIPAY_MERCHANT_CODE="your-merchant-code"
TRIPAY_BASE_URL="https://tripay.co.id/api-sandbox"
TRIPAY_CALLBACK_URL="http://localhost:3000/ppob/callback"
TRIPAY_IS_PRODUCTION=false
```

**Cara Mendapatkan API Key Tripay:**
1. Daftar di https://tripay.co.id
2. Login ke dashboard
3. Pilih menu "API Key"
4. Copy API Key dan Private Key
5. Untuk sandbox, gunakan URL: `https://tripay.co.id/api-sandbox`

### 2. Database Migration

Jalankan migration untuk membuat tabel `ppob_transactions`:

```bash
# Generate migration
npx prisma migrate dev --name add_ppob_transactions

# Atau jika sudah ada migration, jalankan:
npx prisma migrate deploy
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Build dan Run

```bash
# Build
npm run build

# Run development
npm run start:dev

# Run production
npm run start:prod
```

## 📡 API Endpoints

### 1. Get Products

Mendapatkan list produk PPOB yang tersedia dari Tripay.

**Endpoint:** `GET /ppob/products`

**Query Parameters:**
- `type` (optional): Filter by product type
  - `pulsa` - Pulsa/kredit HP
  - `paket_data` - Paket data internet
  - `pln` - Token listrik PLN
  - `bpjs` - BPJS Kesehatan
  - `pdam` - Tagihan air PDAM

**Example Request:**
```bash
curl -X GET "http://localhost:3000/ppob/products?type=pulsa"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Data produk berhasil diambil",
  "data": [
    {
      "code": "TELKOMSEL10",
      "name": "Telkomsel 10.000",
      "type": "pulsa",
      "price": 10500,
      "adminFee": 0,
      "totalPrice": 10500,
      "description": "Pulsa Telkomsel 10.000",
      "status": "available",
      "stock": 999
    }
  ]
}
```

---

### 2. Inquiry Product

Cek harga dan ketersediaan produk sebelum membeli.

**Endpoint:** `POST /ppob/inquiry`

**Request Body:**
```json
{
  "productType": "pulsa",
  "target": "081234567890"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Data produk berhasil diambil",
  "data": [
    {
      "code": "TELKOMSEL10",
      "name": "Telkomsel 10.000",
      "type": "pulsa",
      "price": 10500,
      "adminFee": 0,
      "totalPrice": 10500,
      "description": "Pulsa Telkomsel 10.000",
      "status": "available",
      "stock": 999
    }
  ]
}
```

---

### 3. Purchase Product

Melakukan pembelian produk PPOB.

**Endpoint:** `POST /ppob/purchase`

**Request Body:**
```json
{
  "productType": "pulsa",
  "productCode": "TELKOMSEL10",
  "target": "081234567890",
  "userId": 1,
  "email": "user@example.com"
}
```

**Validasi:**
- User harus ada di database
- Produk harus tersedia
- Saldo user harus mencukupi

**Example Response:**
```json
{
  "success": true,
  "message": "Transaksi PPOB berhasil dibuat",
  "data": {
    "id": 1,
    "referenceId": "PPOB17123456789001234",
    "productCode": "TELKOMSEL10",
    "productName": "Telkomsel 10.000",
    "productType": "pulsa",
    "target": "081234567890",
    "price": 10500,
    "adminFee": 0,
    "totalPrice": 10500,
    "status": "success",
    "userId": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "sn": "SN1705315800000",
    "message": "Transaksi berhasil diproses",
    "tripayReference": "PPOB17123456789001234",
    "tripayStatus": "PAID"
  }
}
```

---

### 4. Check Status

Cek status transaksi PPOB berdasarkan reference ID.

**Endpoint:** `GET /ppob/status/:referenceId`

**Example Request:**
```bash
curl -X GET "http://localhost:3000/ppob/status/PPOB17123456789001234"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Status transaksi berhasil diambil",
  "data": {
    "id": 1,
    "referenceId": "PPOB17123456789001234",
    "productCode": "TELKOMSEL10",
    "productName": "Telkomsel 10.000",
    "status": "success",
    "sn": "SN1705315800000",
    "message": "Transaksi berhasil diproses",
    "tripayStatus": "PAID"
  }
}
```

**Status Values:**
- `pending` - Menunggu pembayaran
- `processing` - Sedang diproses
- `success` - Berhasil
- `failed` - Gagal
- `refunded` - Di-refund

---

### 5. Transaction History

Mendapatkan riwayat transaksi PPOB user dengan pagination.

**Endpoint:** `GET /ppob/history/:userId`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/ppob/history/1?page=1&limit=10"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Riwayat transaksi berhasil diambil",
  "data": [
    {
      "id": 1,
      "referenceId": "PPOB17123456789001234",
      "productName": "Telkomsel 10.000",
      "productType": "pulsa",
      "target": "081234567890",
      "totalPrice": 10500,
      "status": "success",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### 6. Statistics

Mendapatkan statistik transaksi PPOB user.

**Endpoint:** `GET /ppob/stats/:userId`

**Example Request:**
```bash
curl -X GET "http://localhost:3000/ppob/stats/1"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Statistik transaksi berhasil diambil",
  "data": {
    "totalTransactions": 50,
    "totalVolume": 525000,
    "byType": {
      "pulsa": 30,
      "paket_data": 15,
      "pln": 3,
      "bpjs": 1,
      "pdam": 1
    },
    "successRate": 98.5,
    "todayTransactions": 5
  }
}
```

---

### 7. Callback Handler

Endpoint untuk menerima callback dari Tripay (webhook).

**Endpoint:** `POST /ppob/callback`

**Note:** Endpoint ini dipanggil otomatis oleh Tripay ketika status transaksi berubah.

**Request Body (dari Tripay):**
```json
{
  "reference": "T1234567890",
  "merchant_ref": "PPOB17123456789001234",
  "payment_method": "BRIVA",
  "payment_method_code": "BRIVA",
  "total_amount": 10500,
  "fee_merchant": 500,
  "fee_customer": 0,
  "total_fee": 500,
  "amount_received": 10000,
  "is_closed_payment": 1,
  "status": "PAID",
  "paid_at": 1705315800,
  "note": "Transaksi berhasil"
}
```

## 🔄 Flow Transaksi

```
1. User request list produk
   GET /ppob/products?type=pulsa
   ↓
2. User pilih produk dan inquiry
   POST /ppob/inquiry
   ↓
3. User melakukan purchase
   POST /ppob/purchase
   ↓
4. System validasi:
   - User exists?
   - Product available?
   - Saldo cukup?
   ↓
5. System create transaction (status: pending)
   ↓
6. System kurangi saldo user
   ↓
7. System update status (success/failed)
   ↓
8. Jika success: simpan SN/token
   Jika failed: refund saldo
   ���
9. User dapat response dengan status transaksi
```

## 📊 Database Schema

```prisma
model PPOBTransaction {
  id              Int      @id @default(autoincrement())
  reference_id    String   @unique @db.VarChar(100)
  product_code    String   @db.VarChar(50)
  product_name    String   @db.VarChar(255)
  product_type    String   @db.VarChar(50)
  target          String   @db.VarChar(50)
  price           Decimal  @db.Decimal(15, 2)
  admin_fee       Decimal  @default(0) @db.Decimal(15, 2)
  total_price     Decimal  @db.Decimal(15, 2)
  status          String   @default("pending") @db.VarChar(50)
  sn              String?  @db.Text
  message         String?  @db.Text
  email           String?  @db.VarChar(255)
  tripay_reference String?  @db.VarChar(100)
  tripay_status    String?  @db.VarChar(50)
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
  user            User     @relation(fields: [user_id], references: [id])
  user_id         Int
  
  @@index([user_id])
  @@index([reference_id])
  @@index([status])
  @@index([product_type])
  @@map("ppob_transactions")
}
```

## 🧪 Testing

### Test dengan cURL

```bash
# 1. Get products
curl -X GET "http://localhost:3000/ppob/products?type=pulsa"

# 2. Inquiry
curl -X POST "http://localhost:3000/ppob/inquiry" \
  -H "Content-Type: application/json" \
  -d '{
    "productType": "pulsa",
    "target": "081234567890"
  }'

# 3. Purchase
curl -X POST "http://localhost:3000/ppob/purchase" \
  -H "Content-Type: application/json" \
  -d '{
    "productType": "pulsa",
    "productCode": "TELKOMSEL10",
    "target": "081234567890",
    "userId": 1,
    "email": "user@example.com"
  }'

# 4. Check status
curl -X GET "http://localhost:3000/ppob/status/PPOB17123456789001234"

# 5. Get history
curl -X GET "http://localhost:3000/ppob/history/1?page=1&limit=10"

# 6. Get stats
curl -X GET "http://localhost:3000/ppob/stats/1"
```

### Test dengan Postman

1. Import collection dari file `postman_collection.json` (jika ada)
2. Set environment variable `baseUrl` = `http://localhost:3000`
3. Jalankan request satu per satu

## ⚠️ Error Handling

Module ini menangani berbagai error:

| Error | HTTP Code | Message |
|-------|-----------|---------|
| User tidak ditemukan | 404 | User tidak ditemukan |
| Produk tidak ditemukan | 404 | Produk tidak ditemukan |
| Produk tidak tersedia | 400 | Produk sedang tidak tersedia |
| Saldo tidak cukup | 400 | Saldo tidak mencukupi |
| Transaksi tidak ditemukan | 404 | Transaksi tidak ditemukan |
| Gagal ambil produk Tripay | 500 | Gagal mengambil produk PPOB |

## 🔒 Security Notes

⚠️ **PENTING:**

1. **Jangan commit API keys** ke repository
2. **Gunakan HTTPS** untuk production
3. **Validasi callback signature** dari Tripay (bisa ditambahkan)
4. **Rate limiting** untuk prevent abuse
5. **Logging** semua transaksi untuk audit trail
6. **Encrypt sensitive data** di database

## 🐛 Troubleshooting

### Error: "Can't reach database server"
**Solusi:**
- Pastikan MySQL sudah running
- Cek connection string di `.env`
- Test koneksi: `npx prisma db pull`

### Error: "Gagal mengambil produk dari Tripay"
**Solusi:**
- Cek API key dan private key di `.env`
- Pastikan base URL benar (sandbox vs production)
- Cek koneksi internet
- Cek status Tripay API: https://tripay.co.id/status

### Error: "Saldo tidak mencukupi"
**Solusi:**
- User harus top-up saldo terlebih dahulu
- Cek saldo user: `SELECT saldo FROM users WHERE id = ?`

### Error: "Property 'pPOBTransaction' does not exist"
**Solusi:**
- Jalankan: `npx prisma generate`
- Restart TypeScript server di VSCode

### Callback tidak diterima
**Solusi:**
- Pastikan callback URL accessible dari internet
- Gunakan ngrok untuk local testing:
  ```bash
  ngrok http 3000
  ```
- Set callback URL di `.env` ke ngrok URL
- Cek Tripay dashboard untuk callback logs

## 📝 Notes

### Mode Sandbox vs Production

**Sandbox (Development):**
- URL: `https://tripay.co.id/api-sandbox`
- Transaksi tidak real
- Untuk testing dan development
- Tidak perlu saldo real

**Production:**
- URL: `https://tripay.co.id/api`
- Transaksi menggunakan saldo real
- Perlu approval dari Tripay
- Set `TRIPAY_IS_PRODUCTION=true`

### Simulasi di Sandbox

Karena menggunakan sandbox, transaksi akan langsung sukses tanpa perlu pembayaran real. Ini cocok untuk development dan testing.

Untuk production, perlu:
1. Approval dari Tripay
2. Deposit saldo
3. Ubah base URL ke production
4. Implementasi callback signature validation

## 🚀 Next Steps

Fitur yang bisa ditambahkan:

- [ ] Signature validation untuk callback
- [ ] Retry mechanism untuk failed transactions
- [ ] Email/SMS notification setelah transaksi
- [ ] Admin dashboard untuk monitoring
- [ ] Export transaction report (Excel/PDF)
- [ ] Voucher/promo code support
- [ ] Multi-payment method support
- [ ] Scheduled transaction (auto-recharge)
- [ ] Favorite products
- [ ] Transaction receipt (PDF)

## 📞 Support

Untuk pertanyaan atau issue:
- Email: support@tmpay.com
- Tripay Documentation: https://tripay.co.id/developer
- Tripay Support: support@tripay.co.id

---

**Created by:** T-MPay Development Team  
**Last Updated:** January 2024  
**Version:** 1.0.0
