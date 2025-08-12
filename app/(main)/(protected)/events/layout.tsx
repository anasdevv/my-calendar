'use client';

import { usePathname } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCreateOrEdit =
    pathname.includes('/events/new') ||
    /^\/events\/[^/]+\/edit$/.test(pathname);
  console.log('is new event page:', isCreateOrEdit);
  return (
    <div className="container mx-auto px-4 py-8">
      {!isCreateOrEdit ? (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Event Types{' '}
          </h1>

          <p className="text-gray-600">
            Create and manage your different meeting types.{' '}
          </p>
        </div>
      ) : null}
      {children}
    </div>
  );
}
