import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

type Team = {
  id: string;
  name: string;
  tagline: string;
  href: string;
  from: string; // gradient start
  to: string; // gradient end
};

// subcategory value in the DB must match the slug in href (?team=ferrari / ?team=redbull)
const teams: Team[] = [
  {
    id: "ferrari",
    name: "Ferrari",
    tagline: "Scuderia racing jackets",
    href: "/category/jacket?team=ferrari",
    from: "#7a0a0a",
    to: "#d40000",
  },
  {
    id: "redbull",
    name: "Red Bull",
    tagline: "Oracle racing jackets",
    href: "/category/jacket?team=redbull",
    from: "#0b1a3d",
    to: "#1e3a8a",
  },
];

export default function CategorySection() {
  return (
    <section className="container py-2 md:py-4" aria-labelledby="shop-by-team">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2
          id="shop-by-team"
          className="flex items-center gap-3 font-display text-2xl font-bold md:text-3xl"
        >
           <span className="h-7 w-1.5 -skew-x-12 bg-primary" aria-hidden />
          Shop by team
        </h2>

        <Link
          href="/category/jacket"
          className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
        >
          View all
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Team cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {teams.map(({ id, name, tagline, href, from, to }) => (
          <Link
            key={id}
            href={href}
            style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
            className="group relative flex min-h-35 items-end justify-between overflow-hidden rounded-2xl p-5 text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:min-h-45 sm:p-6"
          >
            <span className="relative z-10">
              <span className="block text-xs font-medium uppercase tracking-[0.2em] text-white/70">
                Collection
              </span>
              <span className="mt-1 block text-2xl font-extrabold sm:text-3xl">
                {name}
              </span>
              <span className="mt-1 block text-sm text-white/80">{tagline}</span>
            </span>

            <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-colors duration-300 group-hover:bg-white group-hover:text-black">
              <ArrowUpRight className="h-5 w-5" />
            </span>

            {/* big faded name as decoration */}
            <span
              aria-hidden
              className="pointer-events-none absolute -right-2 -top-4 select-none text-7xl font-black uppercase leading-none text-white/10 sm:text-8xl"
            >
              {name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}