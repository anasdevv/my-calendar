'use client';
import { NavLinks } from '@/constants';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItemProps = (typeof NavLinks)[number];
export const NavItem = ({ href, imageUrl, label }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href);
  return (
    <Link
      href={href}
      key={href}
      className={cn(
        'flex gap-4 items-center p-4 rounded-lg justify-start hover:scale-110 duration-300',
        isActive && 'bg-blue-100 rounded-3xl'
      )}
    >
      <Image src={imageUrl} alt={label} width={30} height={30} />
      <p className={cn('text-lg font-semibold max-lg:hidden')}>{label}</p>
    </Link>
  );
};
