import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function BookingPage() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn();
  }
  return redirect(`/book/${userId}/`);
}
