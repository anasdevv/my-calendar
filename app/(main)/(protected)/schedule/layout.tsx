export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Schedule Settings
        </h1>

        <p className="text-gray-600">
          Configure your availability and working hours.
        </p>
      </div>
      {children}
    </div>
  );
}
