export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export const DAYS_OF_WEEK_MAP: {
  [key: number]: (typeof DAYS_OF_WEEK)[number];
} = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

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
