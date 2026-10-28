"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, X, MapPin, Flag, Zap } from "lucide-react";
import { Suspense, useState } from "react";
import { Button } from "../ui/button";
import ThemeToggle from "./ThemeToggle";

// WhatsApp number (notun Drapelo number boshao: 8801XXXXXXXXX)
const WHATSAPP_NUMBER = "8801894302115";

// Navigation: team collections (all under the jacket category)
const NAV_ITEMS = [
  { name: "Ferrari", team: "ferrari", icon: Flag },
  { name: "Red Bull", team: "redbull", icon: Zap },
];

const teamHref = (team: string) => `/category/jacket?team=${team}`;
const normTeam = (t?: string | null) =>
  (t ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

// WhatsApp Icon
const WhatsAppIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

function NavbarView({ team }: { team: string | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);

  // A team link is active on /category/jacket when ?team= matches
  const isTeamActive = (t: string) =>
    pathname.startsWith("/category/jacket") && normTeam(team) === t;

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl">
      {/* TOP NAVBAR */}
      <div className="container flex h-14 items-center justify-between px-4 md:h-20 md:px-6">
        {" "}
        {/* LOGO */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label="Drapelo home"
        >
          <Image
            src="/logodrapelo.png"
            alt="Drapelo logo"
            width={80}
            height={80}
            priority
            className="h-10 w-10 object-contain md:h-13 md:w-16"
          />

          <span className="whitespace-nowrap font-display text-2xl font-extrabold leading-none tracking-tight text-foreground md:text-4xl">
            {" "}
            <span className="gradient-text">Drapelo</span>
          </span>
        </Link>
        {/* DESKTOP TEAMS */}
        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Collections"
        >
          {NAV_ITEMS.map(({ name, team: t }) => (
            <Link
              key={t}
              href={teamHref(t)}
              className={`rounded-full px-5 py-2.5 text-base font-medium transition-all duration-200 ${
                isTeamActive(t)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {name}
            </Link>
          ))}
        </nav>
        {/* RIGHT SIDE */}
        <div className="flex shrink-0 items-center gap-2">
          {/* WHATSAPP - DESKTOP */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-full px-5 py-2.5 text-base font-medium text-green-600 transition-all duration-200 hover:bg-green-50 hover:text-green-700 lg:flex"
          >
            <WhatsAppIcon className="h-5 w-5" />
            WhatsApp
          </a>

          {/* TRACK ORDER - DESKTOP */}
          <Link
            href="/track-order"
            className={`hidden items-center gap-1.5 rounded-full px-5 py-2.5 text-base font-medium transition-all duration-200 lg:flex ${
              isActive("/track-order")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <MapPin className="h-4 w-4" />
            Track Order
          </Link>
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>

          <div className="lg:hidden">
            <ThemeToggle />
          </div>
          {/* MOBILE MENU BUTTON */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* MOBILE TEAM BAR - BELOW LOGO */}
      <nav
        aria-label="Collections"
        className="flex items-center gap-2 overflow-x-auto px-5 pb-2 pt-0 lg:hidden scrollbar-hide"
      >
        {NAV_ITEMS.map(({ name, team: t }) => (
          <Link
            key={t}
            href={teamHref(t)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              isTeamActive(t)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-secondary"
            }`}
          >
            {name}
          </Link>
        ))}
      </nav>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-border/50 bg-background/95 p-4 backdrop-blur-xl lg:hidden">
          {NAV_ITEMS.map(({ name, team: t, icon: Icon }) => (
            <Link
              key={t}
              href={teamHref(t)}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                isTeamActive(t)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {name}
            </Link>
          ))}

          {/* WHATSAPP - MOBILE */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium text-green-600 transition-colors hover:bg-green-50"
          >
            <WhatsAppIcon className="h-5 w-5" />
            WhatsApp
          </a>

          {/* TRACK ORDER - MOBILE */}
          <Link
            href="/track-order"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <MapPin className="h-5 w-5" />
            Track Order
          </Link>
        </nav>
      )}
    </header>
  );
}

// Reads ?team= (needs Suspense in Next.js App Router)
function NavbarWithTeam() {
  const team = useSearchParams().get("team");
  return <NavbarView team={team} />;
}

const Navbar = () => (
  <Suspense fallback={<NavbarView team={null} />}>
    <NavbarWithTeam />
  </Suspense>
);

export default Navbar;
