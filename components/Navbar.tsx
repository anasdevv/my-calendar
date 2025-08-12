import { Button } from '@/components/ui/button';
import { Calendar, Settings, Plus, BarChart3, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { JSX } from 'react';
import Link from 'next/link';
import { NavLink } from './NavLink';
import { currentUser } from '@clerk/nextjs/server';
import {
  SignedIn,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';

export default async function Navbar() {
  const user = await currentUser();
  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">MeetFlow</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          {Boolean(user) && (
            <>
              <NavLink
                to="/dashboard"
                icon={<BarChart3 className="w-4 h-4" />}
                label="Dashboard"
              />

              <NavLink
                to="/events"
                icon={<Plus className="w-4 h-4" />}
                label="Events"
              />

              <NavLink
                to="/schedule"
                icon={<Calendar className="w-4 h-4" />}
                label="Schedule"
              />
            </>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {Boolean(user) ? (
            <>
              <Link href="/book">
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </Link>
              {user && (
                <div className="hover:scale-150 duration-500">
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>
              )}
            </>
          ) : (
            <>
              <SignInButton>
                <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 cursor-pointer hover:scale-100 duration-500 rounded-2xl shadow-2xl">
                  Login
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button
                  className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 cursor-pointer hover:scale-100 duration-500 rounded-2xl shadow-2xl"
                  variant="outline"
                >
                  Register
                </Button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
