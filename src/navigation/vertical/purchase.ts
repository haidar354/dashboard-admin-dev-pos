export default [
  // ==========================
  // 🧾 PEMBELIAN
  // ==========================
  {
    heading: 'Pembelian',
    action: 'manage',
    subject: 'default',
    rules: [{ action: 'manage', subject: 'default' }],
  },
  {
    title: 'Pembelian Langsung',
    icon: { icon: 'tabler-shopping-cart' },
    to: 'purchase-directs',
    rules: [{ action: 'manage', subject: 'default' }],
  },
  {
    title: 'Permintaan Pembelian',
    icon: { icon: 'tabler-clipboard-plus' },
    to: 'purchase-requisitions',
    rules: [{ action: 'manage', subject: 'default' }],
    disable: true,
  },
  {
    title: 'Pesanan Pembelian',
    icon: { icon: 'tabler-file-description' },
    to: 'purchase-orders',
    rules: [{ action: 'manage', subject: 'default' }],
    disable: true,
  },
  {
    title: 'Penerimaan Pembelian',
    icon: { icon: 'tabler-truck-delivery' },
    to: 'purchase-goods-receipts',
    rules: [{ action: 'manage', subject: 'default' }],
    disable: true,
  },
  {
    title: 'Tagihan Pembelian',
    icon: { icon: 'tabler-file-invoice' },
    to: 'purchase-invoices',
    rules: [{ action: 'manage', subject: 'default' }],
    disable: true,
  },
  {
    title: 'Pembayaran Pembelian',
    icon: { icon: 'tabler-credit-card' },
    to: 'purchase-payments',
    rules: [{ action: 'manage', subject: 'default' }],
    disable: true,
  },
  {
    title: 'Retur Pembelian',
    icon: { icon: 'tabler-corner-up-left' },
    to: 'purchase-returns',
    rules: [{ action: 'manage', subject: 'default' }],
    disable: true,
  },
  {
    heading: 'Pengaturan',
    action: 'manage',
    subject: 'default',
    rules: [{ action: 'manage', subject: 'default' }],
  },
  {
    title: 'Supplier',
    icon: { icon: 'tabler-truck' },
    to: 'purchase-suppliers',
    rules: [{ action: 'manage', subject: 'default' }],
  },
]
