import LandingPage from '@/components/LandingPage';
import { currentUser } from '@clerk/nextjs/server';
import { addMonths, endOfDay, roundToNearestMinutes } from 'date-fns';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await currentUser();
  if (!user) {
    return <LandingPage />;
  }
  return redirect('/events');
}
