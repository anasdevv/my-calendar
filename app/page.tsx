import LandingPage from '@/components/LandingPage';
import { currentUser } from '@clerk/nextjs/server';
import { addMonths, endOfDay, roundToNearestMinutes } from 'date-fns';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await currentUser();
  if (!user) {
    return <LandingPage />;
  }
  const start = roundToNearestMinutes(new Date(), {
    nearestTo: 15,
    roundingMethod: 'ceil',
  });
  const endDate = endOfDay(addMonths(start, 1));
  const validTimeWindows = getValidTimeWindows(start, endDate);

  // const res = await getGoogleEvents(user.id);
  // console.log('Google Calendar Client:', res);
  return redirect('/events');
}
