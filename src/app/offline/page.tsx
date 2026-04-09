export default function OfflinePage() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Geen internetverbinding
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Controleer je internetverbinding en probeer het opnieuw.
        </p>
      </div>
    </div>
  );
}
