"use client";

export function OfflineContent() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10 text-4xl">
        📡
      </div>
      <h1 className="mt-6 text-xl font-extrabold text-gray-900 dark:text-white">
        Geen internetverbinding
      </h1>
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        Controleer je internetverbinding en probeer het opnieuw.
      </p>
      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
        Eerder bezochte pagina&apos;s zijn mogelijk nog beschikbaar.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-accent/90 active:scale-95"
      >
        Opnieuw proberen
      </button>
    </div>
  );
}
