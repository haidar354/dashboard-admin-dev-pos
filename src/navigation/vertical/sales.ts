export default [
  // =============================
  // DASHBOARD
  // =============================
  {
    title: 'Dashboard',
    icon: { icon: 'tabler-home' },
    to: 'sales-dashboard',
    rules: [{ action: 'manage', subject: 'default' }],
  },

  // =============================
  // PENJUALAN
  // =============================
  {
    heading: 'Penjualan',
    action: 'manage',
    subject: 'default',
    rules: [{ action: 'manage', subject: 'default' }],
  },

  {
    title: 'Semua Penjualan',
    icon: { icon: 'tabler-chart-bar' },
    to: 'sales-orders',
    badge: 'All',
    badgeClass: 'bg-primary',
    rules: [{ action: 'manage', subject: 'default' }],
  },

  {
    title: 'Penjualan POS',
    icon: { icon: 'tabler-devices' },
    to: 'sales-pos-orders',
    rules: [{ action: 'manage', subject: 'default' }],
  },

  {
    title: 'Penawaran (SQ)',
    icon: { icon: 'tabler-basket-question' },
    to: 'sales-quotations',
    rules: [{ action: 'manage', subject: 'default' }],
  },

  {
    title: 'Pesanan Penjualan (SO)',
    icon: { icon: 'tabler-shopping-cart' },
    to: 'sales-sales-orders',
    rules: [{ action: 'manage', subject: 'default' }],
  },

  {
    title: 'Pengiriman (DO)',
    icon: { icon: 'tabler-truck' },
    to: 'sales-delivery-orders',
    rules: [{ action: 'manage', subject: 'default' }],
  },

  {
    title: 'Retur Penjualan',
    icon: { icon: 'tabler-rotate-2' },
    to: 'sales-returns',
    rules: [{ action: 'manage', subject: 'default' }],
  },

  // =============================
  // FAKTUR & PEMBAYARAN
  // =============================
  {
    heading: 'Faktur & Pembayaran',
    action: 'manage',
    subject: 'default',
    rules: [{ action: 'manage', subject: 'default' }],
  },

  {
    title: 'Faktur Penjualan',
    icon: { icon: 'tabler-invoice' },
    to: 'sales-invoices',
    rules: [{ action: 'manage', subject: 'default' }],
  },

  {
    title: 'Pembayaran Faktur',
    icon: { icon: 'tabler-cash' },
    to: 'sales-payments',
    rules: [{ action: 'manage', subject: 'default' }],
  },

  {
    title: 'Nota Kredit',
    icon: { icon: 'tabler-notes' },
    to: 'sales-credit-notes',
    rules: [{ action: 'manage', subject: 'default' }],
    disable: true,
  },

  {
    title: 'Pengembalian Dana',
    icon: { icon: 'tabler-receipt-refund' },
    to: 'sales-refunds',
    rules: [{ action: 'manage', subject: 'default' }],
  },

  // =============================
  // LAPORAN & ANALITIK
  // =============================
  {
    heading: 'Laporan & Analitik',
    action: 'manage',
    subject: 'default',
    rules: [{ action: 'manage', subject: 'default' }],
  },

  {
    title: 'Laporan Penjualan',
    icon: { icon: 'tabler-report-analytics' },
    to: 'sales-reports',
    rules: [{ action: 'manage', subject: 'default' }],
  },

  {
    title: 'Analitik Penjualan',
    icon: { icon: 'tabler-chart-dots' },
    to: 'sales-analytics',
    rules: [{ action: 'manage', subject: 'default' }],
  },

  {
    title: 'Performa Produk',
    icon: { icon: 'tabler-trophy' },
    to: 'sales-product-performance',
    rules: [{ action: 'manage', subject: 'default' }],
  },

  {
    title: 'Performa Pelanggan',
    icon: { icon: 'tabler-user-star' },
    to: 'sales-customer-performance',
    rules: [{ action: 'manage', subject: 'default' }],
  },

  // =============================
  // PELANGGAN
  // =============================
  {
    heading: 'Pelanggan',
    action: 'manage',
    subject: 'default',
    rules: [{ action: 'manage', subject: 'default' }],
  },

  {
    title: 'Daftar Pelanggan',
    icon: { icon: 'tabler-users' },
    to: 'sales-customers',
    rules: [{ action: 'manage', subject: 'default' }],
  },
]
