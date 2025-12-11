export default [
  {
    title: 'Dashboard',
    icon: { icon: 'tabler-home' },
    to: 'production-dashboard',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
  {
    heading: 'Production Planning',
  },
  {
    title: 'Production Tasks',
    icon: { icon: 'tabler-list-check' },
    to: 'production-tasks',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
  {
    title: 'Production BOMs',
    icon: { icon: 'tabler-file-description' },
    to: 'production-boms',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
  {
    title: 'Kitchen Display',
    icon: { icon: 'tabler-flame' },
    to: 'production-kitchen-display',
    rules: [
      {
        action: 'manage',
        subject: 'default',
      },
    ],
  },
]
