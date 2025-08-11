'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { JSX } from 'react';

interface NavLinkProps {
  to: string;
  icon: JSX.Element;
  label: string;
}

export const NavLink = ({ to, icon, label }: NavLinkProps) => {
  const pathname = usePathname();
  const active = pathname === to;
  return (
    <Link
      href={to}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};
