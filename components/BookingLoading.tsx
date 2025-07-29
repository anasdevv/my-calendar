import { Calendar, Clock, Users } from 'lucide-react';

export default function BookingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 mx-auto relative">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>

              <div className="absolute inset-0 flex items-center justify-center">
                <Calendar className="w-10 h-10 text-blue-600 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">
              Preparing Your Booking
            </h2>
            <p className="text-gray-600">
              Setting up the perfect time for your meeting...
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-8">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs font-medium text-green-600">
                  Calendar
                </span>
              </div>

              <div className="w-8 h-0.5 bg-gradient-to-r from-green-300 to-blue-300 animate-pulse"></div>

              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center animate-pulse animation-delay-200">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-blue-600">
                  Time Slots
                </span>
              </div>

              <div className="w-8 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 animate-pulse animation-delay-400"></div>

              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center animate-pulse animation-delay-600">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-xs font-medium text-purple-600">
                  Details
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </div>

        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-purple-100 rounded-full opacity-20 animate-pulse animation-delay-300"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-green-100 rounded-full opacity-20 animate-pulse animation-delay-600"></div>
      </div>
    </div>
  );
}
