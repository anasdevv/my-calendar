'use client';

import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EventRow } from '@/lib/types/event';
import { ArrowRight, Calendar, Clock, Globe, Video } from 'lucide-react';
import Link from 'next/link';

type PublicProfileProps = {
  userId: string;
  fullName: string | null;
  events: EventRow[];
};

export default function PublicProfile({
  userId,
  fullName,
  events,
}: PublicProfileProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Book a Meeting with {fullName}
            </h1>
            <p className="text-xl text-gray-600">
              Choose the type of meeting that best fits your needs
            </p>
          </div>

          {/* Event Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[26rem] overflow-y-auto">
            {events.map(event => (
              <Link key={event.id} href={`/book/${userId}/${event.id}`}>
                <Card className="hover:shadow-xl transition-all duration-300 group cursor-pointer border-2 hover:border-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: event.color || '#7C3AED' }}
                        >
                          <Video className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {event.name}
                          </CardTitle>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center text-gray-600">
                              <Clock className="w-4 h-4 mr-1" />
                              {event.duration} min
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Video className="w-4 h-4 mr-1" />
                              {'Video Call'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">
                      {event.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What to Expect
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  Easy scheduling
                </div>
                <div className="flex items-center">
                  <Video className="w-4 h-4 mr-2 text-primary" />
                  Video conference link
                </div>
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2 text-primary" />
                  Automatic time zones
                </div>
              </div>
              <p className="mt-4 text-gray-600">
                You'll receive a confirmation email with the meeting details and
                video link once your booking is confirmed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
