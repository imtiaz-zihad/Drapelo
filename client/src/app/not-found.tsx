import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";

export const metadata = {
  title: "Page not found | Drapelo",
};

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-16 text-center">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-primary">
        Off track
      </p>

      <h1 className="gradient-text font-display text-8xl font-extrabold leading-none md:text-[10rem]">
        404
      </h1>

      <div className="racing-stripe my-5 h-1.5 w-40 md:w-56" aria-hidden />

      <h2 className="font-display text-2xl uppercase md:text-4xl">
        This page took a wrong turn
      </h2>
      <p className="mt-3 max-w-md text-sm text-muted-foreground md:text-base">
        The page you are looking for does not exist or has been moved. Head back
        to the pits and pick your jacket.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>

        <Link
          href="/category/jacket?team=ferrari"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 text-sm font-semibold transition-colors hover:bg-secondary"
        >
          Ferrari <ArrowRight className="h-4 w-4" />
        </Link>

        <Link
          href="/category/jacket?team=redbull"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 text-sm font-semibold transition-colors hover:bg-secondary"
        >
          Red Bull <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="checkered mt-14 h-3 w-full max-w-xs opacity-60" aria-hidden />
    </main>
  );
}