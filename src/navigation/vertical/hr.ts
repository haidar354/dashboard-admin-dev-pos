export default [
  {
    title: 'Dashboard',
    icon: { icon: 'tabler-home' },
    to: 'hr-dashboard',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
  {
    title: 'Karyawan',
    icon: { icon: 'tabler-user-circle' },
    to: 'hr-employees',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
]
