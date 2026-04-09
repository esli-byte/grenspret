import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <header className="bg-gradient-to-r from-primary to-primary-light px-4 pb-6 pt-5">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-accent-light/80 transition-colors hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Terug
        </Link>
        <h1 className="mt-2 text-xl font-extrabold text-white">{title}</h1>
        <p className="mt-1 text-sm text-accent-light/80">{subtitle}</p>
      </div>
    </header>
  );
}
