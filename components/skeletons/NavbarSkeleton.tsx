export const NavbarSkeleton = () => {
  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo Skeleton */}
        <div className="flex items-center space-x-2 animate-pulse">
          <div className="w-8 h-8 bg-gray-300 rounded-lg" />
          <div className="w-20 h-5 bg-gray-300 rounded" />
        </div>

        {/* Navigation Skeleton (Desktop only) */}
        <nav className="hidden md:flex items-center space-x-2">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="flex items-center space-x-2 px-3 py-2 rounded-md animate-pulse"
            >
              <div className="w-4 h-4 bg-gray-300 rounded" />
              <div className="w-16 h-4 bg-gray-300 rounded" />
            </div>
          ))}
        </nav>

        {/* Right Side Actions Skeleton */}
        <div className="flex items-center space-x-3 animate-pulse">
          {/* Preview Button */}
          <div className="w-20 h-8 bg-gray-300 rounded" />

          {/* User Avatar */}
          <div className="w-8 h-8 bg-gray-300 rounded-full" />
        </div>
      </div>
    </header>
  );
};
