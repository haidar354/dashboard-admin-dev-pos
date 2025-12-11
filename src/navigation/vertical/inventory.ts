export default [
  // ==========================
  // 📊 DASHBOARD
  // ==========================
  {
    title: 'Dashboard',
    icon: { icon: 'tabler-home' },
    to: 'inventory-dashboard',
    rules: [{ action: 'manage', subject: 'default' }],
  },

  // ==========================
  // 📦 STOK
  // ==========================
  {
    heading: 'Stok',
    action: 'manage',
    subject: 'default',
    rules: [{ action: 'manage', subject: 'default' }],
  },
  {
    title: 'Daftar Stok',
    icon: { icon: 'tabler-box' },
    to: 'inventory-item-sku-stocks',
    rules: [{ action: 'manage', subject: 'default' }],
  },
  {
    title: 'Stok Opname',
    icon: { icon: 'tabler-adjustments-horizontal' },
    to: 'inventory-stock-counts',
    rules: [{ action: 'manage', subject: 'default' }],
  },
  {
    title: 'Penyesuaian Stok',
    icon: { icon: 'tabler-adjustments-horizontal' },
    to: 'inventory-stock-adjustments',
    rules: [{ action: 'manage', subject: 'default' }],
    disable: true,
  },
  {
    title: 'Transfer Stok',
    icon: { icon: 'tabler-arrows-transfer-up-down' },
    to: 'inventory-stock-transfers',
    rules: [{ action: 'manage', subject: 'default' }],
    disable: true,
  },
  {
    title: 'Mutasi Stok',
    icon: { icon: 'tabler-reload' },
    to: 'inventory-stock-mutations',
    rules: [{ action: 'manage', subject: 'default' }],
  },
]
