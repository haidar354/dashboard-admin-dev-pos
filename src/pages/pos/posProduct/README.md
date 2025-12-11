# POS Product Page - README

## Overview
Halaman utama Point of Sale (POS) untuk mengelola pesanan dan transaksi penjualan dengan interface yang intuitif dan modern mengikuti desain Vuetify.

## Struktur Halaman

### Layout
```
┌─────────────────────────────────────────────────────┐
│  [Sidebar] │ [Header - Logo, Kasir, Tanggal]        │
│            ├─────────────────────────────────────────┤
│  [Nav]     │ [Content Area]                         │
│  Icons     │ ┌──────────────┬────────────────────┐  │
│            │ │              │  Pesanan Saat Ini │  │
│            │ │   Produk     │  - Nama Tamu      │  │
│            │ │   Grid       │  - Order Type     │  │
│            │ │   dengan     │  - Item List      │  │
│            │ │   Kategori   │  - Konfirmasi     │  │
│            │ │              │                    │  │
│            │ └──────────────┴────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Fitur Utama

### 1. **Sidebar Navigation**
- Home (Beranda)
- POS (Active)
- Transaksi
- Pengeluaran
- Produk
- Settings
- Profil

### 2. **Header**
- Logo outlet (Teknoreka Chicken)
- Lokasi cabang
- Nama kasir dengan avatar
- Tanggal lengkap

### 3. **Product Grid Section**
- **Category Tabs**: Filter produk berdasarkan kategori
  - Semua (30)
  - Promo (15)
  - Hidangan Utama (5)
  - Makanan (3)
  - Minuman (3)
  - Snack (3)
- **Search Bar**: Pencarian produk real-time
- **Product Cards**: 
  - Gambar produk
  - Badge stok
  - Nama produk
  - Harga (dengan strikethrough untuk diskon)

### 4. **Order Panel (Right Sidebar)**
- **Visitor Name Input**: Input nama pengunjung
- **Order Type Selection**:
  - Dine In
  - Take Away
  - Online
- **Order Items List**:
  - Gambar produk mini
  - Nama & detail (varian, topping)
  - Harga total
  - Quantity controls (+/-)
  - Delete button
  - More options
- **Confirm Order Button**

### 5. **Product Detail Modal** (Desain Image 3)
Ketika produk diklik, modal akan tampil dengan:
- Gambar produk besar
- Nama & harga produk
- **Catatan**: Text area untuk catatan khusus
- **Aktifkan Potongan**: Toggle untuk diskon
- **Pilih Varian**: 
  - Radio buttons untuk varian produk
  - Tampilan stok per varian
  - Harga tambahan (jika ada)
- **Pilih Topping**:
  - Checkbox untuk multiple toppings
  - Harga per topping
  - Stok tersedia
- **Summary**:
  - Diskon
  - Tambahan
  - Total Pembayaran
- **Quantity Control** & **Add to Order Button**

### 6. **Payment Confirmation Modal** (Desain Image 1)
Ketika konfirmasi pesanan diklik, modal akan tampil dengan:

**Kiri:**
- **Opsi Pembayaran**:
  - Tunai (dengan input nominal & info kembalian)
  - QRIS
  - EDC
- Payment method cards dengan icon dan counter

**Kanan:**
- **Kode Promo**: Input field dengan button "Klaim"
- **Ringkasan Pembayaran**:
  - Total
  - Diskon
  - PPN (10%)
  - Jumlah Total
  - Pembulatan
  - Total Pembayaran (highlighted)
- **Action Buttons**:
  - Bayar Sekarang (Primary)
  - Bayar Nanti (Outlined)

## Dummy Data

### Products
Setiap produk memiliki:
```typescript
{
  id: number
  name: string
  price: number
  originalPrice?: number  // untuk produk diskon
  category: string
  stock: number
  image: string
  variants: Array<{
    id: number
    name: string
    stock: number
    price: number  // harga tambahan
  }>
  toppings: Array<{
    id: number
    name: string
    price: number
    stock: number
  }>
}
```

### Order Items
```typescript
{
  id: number
  productId: number
  name: string
  image: string
  basePrice: number
  quantity: number
  variant: Variant | null
  toppings: Topping[]
  notes: string
  totalPrice: number
}
```

## Interaksi User

### Flow Pemesanan
```
1. User klik produk
   ↓
2. Modal detail produk muncul
   ↓
3. User pilih varian & topping
   ↓
4. User set quantity & add note (opsional)
   ↓
5. User klik "Masukan ke Pesanan"
   ↓
6. Item masuk ke order panel
   ↓
7. User bisa edit quantity atau hapus item
   ↓
8. User klik "Konfirmasi Pesanan"
   ↓
9. Modal pembayaran muncul
   ↓
10. User pilih metode pembayaran
    ↓
11. User input nominal (jika tunai)
    ↓
12. User klik "Bayar Sekarang"
    ↓
13. Transaksi selesai
```

## Styling & Theme

### Colors
- Primary: Vuetify default primary (dapat dikustomisasi)
- Success: untuk statistik positif
- Warning: untuk alerts
- Info: untuk informasi
- Error: untuk delete actions

### Layout Responsiveness
- Sidebar: Fixed 72px
- Product Grid: Auto-fill responsive grid
- Order Panel: Fixed 420px width
- Modals: Max-width 900px, responsive

### Hover Effects
- Product cards: translateY + shadow
- Stat cards: translateY + shadow
- Payment method cards: border color change + background tint

## Technical Details

### Vue Composition API
- `ref()` untuk reactive state
- `computed()` untuk derived state
- `watch()` untuk side effects (jika diperlukan)

### State Management
- Local component state (ref)
- Tidak menggunakan Pinia/Vuex (untuk simplicity dengan dummy data)
- Production: migrate to Pinia store

### Routing
- Path: `/pos/posProduct`
- Layout: `blank` (full screen tanpa default layout)
- Navigation: Vue Router `push()`

## Future Enhancements

### Phase 1 - Backend Integration
- [ ] Connect to API endpoints
- [ ] Real product data
- [ ] Real-time inventory updates
- [ ] Order persistence

### Phase 2 - Features
- [ ] Receipt printing
- [ ] Order history
- [ ] Customer management
- [ ] Loyalty points

### Phase 3 - Advanced
- [ ] Offline mode
- [ ] Multi-currency
- [ ] Split payment
- [ ] Barcode scanner integration

## Notes
- Semua data saat ini adalah dummy/mockup
- Tidak ada persistence, data hilang saat refresh
- Tidak ada validasi backend
- Untuk production, implement proper API integration dan error handling
