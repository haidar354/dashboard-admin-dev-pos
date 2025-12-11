export default [
  {
    title: 'Dashboard',
    icon: { icon: 'tabler-home' },
    to: 'setting-dashboard',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
  {
    title: 'Profile',
    icon: { icon: 'tabler-user' },
    to: 'setting-profile',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
    children: [
      {
        title: 'Profil Akun',
        icon: { icon: 'tabler-user' },
        to: 'setting-profile-account',
        rules: [
          {
            action: 'manage',
            subject: 'default',
          },
        ],
      },
      {
        title: 'Profil Perusahaan',
        icon: { icon: 'tabler-building' },
        to: 'setting-profile-company',
        rules: [
          {
            action: 'manage',
            subject: 'default',
          },
        ],
      },
    ],
  },
  {
    title: 'Unit Bisnis',
    icon: { icon: 'tabler-building-skyscraper' },
    to: 'setting-business-units',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
  {
    title: 'Outlet',
    icon: { icon: 'tabler-building-store' },
    to: 'setting-outlets',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
  {
    title: 'Karyawan',
    icon: { icon: 'tabler-user' },
    to: 'hr-employees',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
]
