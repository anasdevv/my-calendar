import { SignIn } from '@clerk/nextjs';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <main className="flex flex-col items-center gap-10 p-10 animate-fade-in">
      <Image
        src="/logo2.svg"
        alt="My Calendar Logo"
        width={100}
        height={100}
        className="rounded-full pt-4"
      />
      {/* <h1 className="text-3xl font-bold">Welcome to My Calendar</h1> */}
      <div className="mt-3">
        <SignIn />
      </div>
    </main>
  );
}
