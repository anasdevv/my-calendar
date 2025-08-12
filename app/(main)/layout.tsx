import Navbar from '@/components/Navbar';
import { NavbarSkeleton } from '@/components/skeletons/NavbarSkeleton';
import { Suspense } from 'react';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative">
      <Suspense fallback={<NavbarSkeleton />}>
        <Navbar />
      </Suspense>
      <section className="pt-6">{children}</section>
    </main>
  );
}
