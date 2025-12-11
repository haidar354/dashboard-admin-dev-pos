# 📊 Referensi Enum - Bahasa Indonesia

Dokumen ini berisi semua enum yang digunakan dalam API Sales & Production dengan terjemahan Bahasa Indonesia.

---

## 🔖 Cara Penggunaan

Gunakan **Kode** dalam API request/response, dan **Label Indonesia** untuk tampilan UI.

---

## 📦 Status Pesanan Penjualan (Sales Order Status)

| Kode | Label Indonesia | Keterangan | Warna UI |
|------|----------------|------------|----------|
| `DRAFT` | **Draft** | Pesanan masih draft, dapat diedit | 🟡 Kuning |
| `CONFIRMED` | **Dikonfirmasi** | Pesanan dikonfirmasi, siap produksi | 🔵 Biru |
| `IN_PRODUCTION` | **Dalam Produksi** | Sedang diproduksi | 🟣 Ungu |
| `READY` | **Siap Kirim** | Siap untuk dikirim | 🟢 Hijau Muda |
| `PARTIALLY_DELIVERED` | **Terkirim Sebagian** | Sebagian item sudah dikirim | 🟠 Oranye |
| `DELIVERED` | **Terkirim** | Semua item sudah dikirim | 🟢 Hijau |
| `COMPLETED` | **Selesai** | Lunas dan terkirim semua | ✅ Hijau Tua |
| `CANCELLED` | **Dibatalkan** | Pesanan dibatalkan | 🔴 Merah |

**Alur Status:**
```
DRAFT → CONFIRMED → IN_PRODUCTION → READY → DELIVERED → COMPLETED
                ↓
            CANCELLED
```

---

## 🏭 Status Tugas Produksi (Production Task Status)

| Kode | Label Indonesia | Keterangan | Warna UI |
|------|----------------|------------|----------|
| `PENDING` | **Menunggu** | Terjadwal, belum dimulai | 🟡 Kuning |
| `QUEUED` | **Antrian** | Dalam antrian (tampilan dapur) | 🟠 Oranye |
| `IN_PROGRESS` | **Sedang Dikerjakan** | Sedang dalam pengerjaan | 🔵 Biru |
| `COMPLETED` | **Selesai** | Selesai dengan sukses | 🟢 Hijau |
| `CANCELLED` | **Dibatalkan** | Dibatalkan | 🔴 Merah |

**Alur Status:**
```
PENDING → QUEUED → IN_PROGRESS → COMPLETED
            ↓
        CANCELLED
```

---

## 🚚 Status Pengiriman (Delivery Status)

| Kode | Label Indonesia | Keterangan | Warna UI |
|------|----------------|------------|----------|
| `PENDING` | **Menunggu** | Terjadwal tapi belum dikirim | 🟡 Kuning |
| `IN_TRANSIT` | **Dalam Perjalanan** | Sedang dalam perjalanan ke pelanggan | 🔵 Biru |
| `DELIVERED` | **Terkirim** | Berhasil dikirim | 🟢 Hijau |
| `FAILED` | **Gagal** | Pengiriman gagal | 🔴 Merah |
| `CANCELLED` | **Dibatalkan** | Pengiriman dibatalkan | ⚫ Abu-abu |

**Alur Status:**
```
PENDING → IN_TRANSIT → DELIVERED
            ↓
        FAILED / CANCELLED
```

---

## 💰 Status Pembayaran (Payment Status)

| Kode | Label Indonesia | Keterangan | Warna UI |
|------|----------------|------------|----------|
| `PENDING` | **Menunggu** | Pembayaran diharapkan tapi belum diterima | 🟡 Kuning |
| `CONFIRMED` | **Terkonfirmasi** | Pembayaran diterima dan dikonfirmasi | 🟢 Hijau |
| `PARTIAL` | **Sebagian** | Pembayaran sebagian diterima | 🟠 Oranye |
| `REFUNDED` | **Dikembalikan** | Pembayaran dikembalikan | 🔵 Biru |
| `CANCELLED` | **Dibatalkan** | Pembayaran dibatalkan | 🔴 Merah |

---

## 💳 Metode Pembayaran (Payment Methods)

| Kode | Label Indonesia | Keterangan | Icon |
|------|----------------|------------|------|
| `CASH` | **Tunai** | Pembayaran tunai | 💵 |
| `TRANSFER` | **Transfer Bank** | Transfer bank | 🏦 |
| `CARD` | **Kartu Kredit/Debit** | Kartu kredit/debit | 💳 |
| `QRIS` | **QRIS** | Pembayaran QRIS | 📱 |
| `E_WALLET` | **Dompet Digital** | E-wallet (GoPay, OVO, DANA, dll) | 📲 |
| `COD` | **Bayar di Tempat** | Cash on delivery | 🚚 |
| `CREDIT` | **Kredit** | Termin kredit | 📄 |

---

## 📅 Termin Pembayaran (Payment Terms)

| Kode | Label Indonesia | Keterangan | Jatuh Tempo |
|------|----------------|------------|-------------|
| `IMMEDIATE` | **Segera** | Bayar segera | Hari ini |
| `NET_7` | **Net 7 Hari** | Jatuh tempo 7 hari | +7 hari |
| `NET_14` | **Net 14 Hari** | Jatuh tempo 14 hari | +14 hari |
| `NET_30` | **Net 30 Hari** | Jatuh tempo 30 hari | +30 hari |
| `NET_45` | **Net 45 Hari** | Jatuh tempo 45 hari | +45 hari |
| `NET_60` | **Net 60 Hari** | Jatuh tempo 60 hari | +60 hari |
| `COD` | **Bayar di Tempat** | Cash on delivery | Saat terima |
| `CUSTOM` | **Kustom** | Termin pembayaran kustom | Sesuai kesepakatan |

---

## 📦 Tipe Sumber Produksi (Production Source Types)

| Kode | Label Indonesia | Keterangan | Icon |
|------|----------------|------------|------|
| `STOCK` | **Stok** | Pengisian ulang stok | 📦 |
| `POS_ORDER` | **Pesanan POS** | Pesanan pelanggan POS | 🛒 |
| `SALES_ORDER` | **Pesanan Penjualan** | Pesanan penjualan | 📋 |
| `MANUAL` | **Manual** | Produksi manual | ✍️ |

---

## 🔧 Tipe Tugas Produksi (Production Task Types)

| Kode | Label Indonesia | Keterangan | Icon |
|------|----------------|------------|------|
| `KITCHEN` | **Dapur** | Memasak F&B | 🍳 |
| `BAR` | **Bar** | Minuman | 🍹 |
| `COFFEE` | **Kopi** | Stasiun kopi | ☕ |
| `ASSEMBLY` | **Perakitan** | Perakitan/manufaktur | 🔧 |
| `PREP` | **Persiapan** | Persiapan bahan | 🔪 |
| `BULK` | **Produksi Massal** | Produksi massal | 🏭 |
| `CUSTOM` | **Kustom** | Pesanan kustom | ⚙️ |

---

## 📋 Tipe Produksi BOM (BOM Production Types)

| Kode | Label Indonesia | Keterangan | Icon |
|------|----------------|------------|------|
| `COOKING` | **Memasak** | Memasak/persiapan F&B | 🍳 |
| `ASSEMBLY` | **Perakitan** | Perakitan/manufaktur | 🔧 |
| `PROCESSING` | **Pengolahan** | Pengolahan makanan | ⚙️ |
| `PACKAGING` | **Pengemasan** | Operasi pengemasan | 📦 |
| `DISASSEMBLY` | **Pembongkaran** | Memecah (mis. ayam utuh → bagian) | ✂️ |

---

## 🏪 Tipe Stasiun (Station Types)

| Kode | Label Indonesia | Keterangan | Icon |
|------|----------------|------------|------|
| `KITCHEN` | **Dapur Utama** | Dapur utama | 🍳 |
| `BAR` | **Stasiun Bar** | Stasiun bar | 🍹 |
| `COFFEE` | **Stasiun Kopi** | Stasiun kopi | ☕ |
| `GRILL` | **Stasiun Grill** | Stasiun grill | 🔥 |
| `PASTRY` | **Stasiun Pastry** | Stasiun pastry/bakery | 🥐 |
| `PREP` | **Stasiun Persiapan** | Stasiun persiapan | 🔪 |
| `ASSEMBLY` | **Lini Perakitan** | Lini perakitan | 🏭 |

---

## 👥 Tipe Pelanggan (Customer Types)

| Kode | Label Indonesia | Keterangan | Icon |
|------|----------------|------------|------|
| `INDIVIDUAL` | **Perorangan** | Pelanggan perorangan | 👤 |
| `CORPORATE` | **Perusahaan** | Pelanggan perusahaan | 🏢 |
| `RESELLER` | **Reseller** | Reseller/distributor | 🏪 |

---

## 💡 Contoh Penggunaan dalam Kode

### Frontend (React/Vue/Angular)

```javascript
// Mapping enum ke label Indonesia
const statusLabels = {
  DRAFT: 'Draft',
  CONFIRMED: 'Dikonfirmasi',
  IN_PRODUCTION: 'Dalam Produksi',
  READY: 'Siap Kirim',
  DELIVERED: 'Terkirim',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan'
};

// Mapping enum ke warna
const statusColors = {
  DRAFT: 'yellow',
  CONFIRMED: 'blue',
  IN_PRODUCTION: 'purple',
  READY: 'green',
  DELIVERED: 'green',
  COMPLETED: 'green',
  CANCELLED: 'red'
};

// Penggunaan
const order = { status: 'CONFIRMED' };
console.log(statusLabels[order.status]); // Output: "Dikonfirmasi"
```

### Backend (PHP/Laravel)

```php
// Enum constants
class SalesOrderStatus {
    const DRAFT = 'DRAFT';
    const CONFIRMED = 'CONFIRMED';
    const IN_PRODUCTION = 'IN_PRODUCTION';
    const READY = 'READY';
    const DELIVERED = 'DELIVERED';
    const COMPLETED = 'COMPLETED';
    const CANCELLED = 'CANCELLED';
    
    public static function getLabel($status) {
        $labels = [
            self::DRAFT => 'Draft',
            self::CONFIRMED => 'Dikonfirmasi',
            self::IN_PRODUCTION => 'Dalam Produksi',
            self::READY => 'Siap Kirim',
            self::DELIVERED => 'Terkirim',
            self::COMPLETED => 'Selesai',
            self::CANCELLED => 'Dibatalkan',
        ];
        return $labels[$status] ?? $status;
    }
}
```

### Database (MySQL/PostgreSQL)

```sql
-- Menggunakan ENUM di database
CREATE TABLE sales_orders (
    id VARCHAR(36) PRIMARY KEY,
    status ENUM(
        'DRAFT',
        'CONFIRMED',
        'IN_PRODUCTION',
        'READY',
        'PARTIALLY_DELIVERED',
        'DELIVERED',
        'COMPLETED',
        'CANCELLED'
    ) DEFAULT 'DRAFT',
    -- kolom lainnya...
);
```

---

## 🎨 Rekomendasi Warna untuk UI

### Status Positif
- ✅ **Selesai/Sukses**: `#10B981` (Hijau)
- 🟢 **Aktif/Siap**: `#22C55E` (Hijau Muda)
- 🔵 **Dalam Proses**: `#3B82F6` (Biru)

### Status Menunggu
- 🟡 **Pending/Menunggu**: `#F59E0B` (Kuning)
- 🟠 **Sebagian**: `#F97316` (Oranye)

### Status Negatif
- 🔴 **Dibatalkan/Gagal**: `#EF4444` (Merah)
- ⚫ **Nonaktif**: `#6B7280` (Abu-abu)

---

## 📝 Catatan Penting

1. **Konsistensi**: Selalu gunakan kode enum yang sama di seluruh sistem
2. **Validasi**: Validasi input enum di backend sebelum menyimpan ke database
3. **Dokumentasi**: Update dokumentasi ini jika ada penambahan enum baru
4. **Terjemahan**: Label Indonesia dapat disesuaikan dengan preferensi bisnis
5. **UI/UX**: Gunakan warna yang konsisten untuk status yang sama di seluruh aplikasi

---

**Terakhir Diperbarui:** 2025-11-27  
**Versi:** 1.0
