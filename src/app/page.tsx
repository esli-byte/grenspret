export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="bg-blue-800 text-white px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold">Grensbesparing</h1>
          <p className="mt-1 text-blue-200 text-sm">
            Loont het om over de grens te tanken of boodschappen te doen?
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <a
            href="/tanken"
            className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="text-3xl mb-3">⛽</div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tanken
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Vergelijk brandstofprijzen in Nederland, Duitsland en België en
              bereken je besparing.
            </p>
          </a>

          <a
            href="/boodschappen"
            className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="text-3xl mb-3">🛒</div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Boodschappen
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Vergelijk boodschappenprijzen en bereken of de rit naar de grens
              loont.
            </p>
          </a>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-4 text-center text-xs text-gray-500">
        Grensbesparing &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
