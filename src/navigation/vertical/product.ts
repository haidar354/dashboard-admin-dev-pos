export default [

  {
    title: 'Dashboard',
    icon: { icon: 'tabler-home' },
    to: 'product-dashboard',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
  {
    heading: 'Produk',
    action: 'manage',
    subject: 'default',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
  {
    title: 'Kategori Produk',
    icon: { icon: 'tabler-list-search' },
    to: 'product-item-categories',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
  {
    title: 'Satuan Produk',
    icon: { icon: 'tabler-scale' },
    to: 'product-units',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
  {
    title: 'Daftar Produk',
    icon: { icon: 'tabler-box' },
    to: 'product-items',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
  {
    title: 'Produk Paket',
    icon: { icon: 'tabler-box' },
    disable: true,
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
  {
    title: 'Produk Ekstra',
    icon: { icon: 'tabler-burger' },
    to: 'product-item-modifiers',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
]
