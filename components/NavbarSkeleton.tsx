export const NavbarSkeleton = () => {
  return (
    <nav className="flex justify-between items-center fixed z-50 w-full h-28 bg-gray-300 px-10 gap-4 shadow-2xl">
      {/* Logo skeleton */}
      <div className="flex items-center gap-1">
        <div className="w-[60px] h-[60px] bg-gray-400/50 rounded-full animate-pulse" />
      </div>

      {/* Navigation items skeleton */}
      <section className="sticky top-0 flex justify-between">
        <div className="flex flex-1 max-sm:gap-0 sm:gap-6">
          {/* Skeleton for nav items (3 items matching NavItem structure) */}
          {[1, 2, 3].map(item => (
            <div
              key={item}
              className="flex gap-4 items-center p-4 rounded-lg justify-start animate-pulse"
            >
              <div className="w-[30px] h-[30px] bg-gray-400/50 rounded" />
              <div className="w-20 h-4 bg-gray-400/50 rounded max-lg:hidden" />
            </div>
          ))}
        </div>
      </section>

      {/* User button skeleton */}
      <div className="w-8 h-8 bg-gray-400/50 rounded-full animate-pulse" />
    </nav>
  );
};
