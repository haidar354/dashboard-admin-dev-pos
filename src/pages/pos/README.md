# POS Module - README

## Quick Start

### Akses Halaman POS
Navigasi ke: `http://localhost:[PORT]/pos`

### Demo Login Credentials

#### Kasir 1: Yola Tamara
- Password: `kasir123`
- PIN: `123456`

#### Kasir 2: Dilla Vindhi  
- Password: `kasir456`
- PIN: `654321`

#### Kasir 3: Andre Permana
- Password: `kasir789`
- PIN: `111222`

---

## File Structure

```
pos/
├── index.vue                 # Entry point - Pilih Outlet
├── outlets/
│   └── index.vue            # Redirect to parent
├── cashiers/
│   ├── index.vue            # Pilih Kasir
│   ├── login.vue            # Login dengan Password
│   ├── pin.vue              # Login dengan PIN
│   └── cash.vue             # Input Tunai Laci
└── beranda/
    └── index.vue            # POS Dashboard
```

---

## User Flow

```
1. [/pos] Pilih Outlet
   ↓
2. [/pos/cashiers] Pilih Kasir
   ↓
3. [/pos/cashiers/login] Login Password
   atau
   [/pos/cashiers/pin] Login PIN
   ↓
4. [/pos/cashiers/cash] Input Tunai Laci
   ↓
5. [/pos/beranda] Dashboard POS
```

---

## Features

### ✅ Pilih Outlet
- List outlets dengan search
- Card interaktif
- Responsive design

### ✅ Pilih Kasir
- List kasir dengan avatar
- Search functionality
- Back navigation

### ✅ Login Password
- Secure password input
- Toggle visibility
- Error handling
- Switch to PIN option

### ✅ Login PIN
- 6-digit PIN pad
- Visual feedback
- Auto-submit
- Backspace & clear functions

### ✅ Input Tunai Laci
- Currency formatting
- Confirmation checkbox
- Validation

### ✅ Dashboard POS
- Real-time clock
- Shift statistics
- Quick action cards
- Transaction list
- Logout function

---

## Design Features

### 🎨 Branding
- Sidebar: Blue gradient (#1e3a8a → #1e40af)
- Logo: BAKOELKU
- Tagline: "Cerdas kelola, lancar jualan"

### 📱 Responsive
- Mobile-first approach
- Flexible layouts
- Touch-friendly buttons

### 🎭 Animations
- Hover effects
- Smooth transitions
- Loading states

---

## Development Notes

### Dummy Data Location
All dummy data defined in respective component files:
- Outlets: `pos/index.vue`
- Cashiers: `pos/cashiers/index.vue`

### LocalStorage Keys
- `selectedOutlet`: Current selected outlet
- `selectedCashier`: Current selected cashier
- `currentShift`: Active shift data

### State Management
Currently using localStorage. For production, migrate to:
- Vuex/Pinia for state management
- API integration for data persistence

---

## Next Steps for Production

1. **Backend Integration**
   - Create API endpoints for outlets, cashiers
   - Implement JWT authentication
   - Real-time shift management

2. **Security**
   - Hash passwords
   - Encrypt sensitive data
   - Implement session timeout

3. **Features**
   - Transaction module
   - Receipt printing
   - Reporting system
   - Inventory management

4. **Testing**
   - Unit tests with Vitest
   - E2E tests with Playwright
   - Integration tests

---

## Support

For questions or issues, contact the development team.

**Built with Vue 3 + Vuetify**
