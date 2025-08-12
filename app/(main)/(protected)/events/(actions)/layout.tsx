import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  console.log('Layout for events page rendered');
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/events"
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Create New Event Type
        </h1>
        <p className="text-gray-600 mt-2">
          Set up a new meeting type for people to book with you.
        </p>
      </div>
      {children}
    </div>
  );
}
