import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <p className="font-display text-3xl text-navy-900 dark:text-foreground">
        404
      </p>
      <p className="mt-2 text-sm text-foreground-muted">
        We couldn&apos;t find that page.
      </p>
      <Link
        href="/dashboard"
        className="mt-5 rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
