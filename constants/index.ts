export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export const NavLinks = [
  {
    imageUrl: '/events.svg',
    label: 'My Events',
    href: '/events',
  },
  {
    imageUrl: '/schedule.svg',
    label: 'My Schedule',
    href: '/schedule',
  },
  {
    imageUrl: '/public.svg',
    label: 'Public Profile',
    href: '/book',
  },
] as const;
