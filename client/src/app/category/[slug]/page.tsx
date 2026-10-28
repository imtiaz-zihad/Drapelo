import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";

import { getProductsByCategory } from "@/services/api";
import { Product } from "@/types/product";
import JerseyCard from "@/components/Common/JerseyCard";

// ✅ Next.js 15: params and searchParams are Promises
interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ team?: string }>;
}

// ✅ Revalidate every 60 seconds (ISR)
export const revalidate = 60;

// Keep slugs in sync with Navbar, CategorySection and your DB category values
const CATEGORY_INFO: Record<string, { title: string; description: string }> = {
  "club-jersey": {
    title: "Club Jerseys",
    description: "Home, away and third kits from your favourite clubs",
  },
  "country-jersey": {
    title: "Country Jerseys",
    description: "National team kits for every tournament",
  },
  retro: {
    title: "Retro Jerseys",
    description: "Classic kits from football's golden eras",
  },
  jacket: {
    title: "Jackets",
    description: "Premium racing-inspired jackets",
  },
};

// Display names for team slugs (add Mercedes etc. later)
const TEAM_NAMES: Record<string, string> = {
  ferrari: "Ferrari",
  redbull: "Red Bull",
  mercedes: "Mercedes",
};

// "red-bull" / "red_bull" / "Red Bull" / "redbull" → "redbull"
function teamKey(raw?: string): string | undefined {
  if (!raw) return undefined;
  return raw.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Fallback for slugs not in CATEGORY_INFO: "t-shirts" → "T Shirts"
function formatCategoryName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getCategoryInfo(slug: string) {
  return (
    CATEGORY_INFO[slug] ?? {
      title: formatCategoryName(slug),
      description: `Explore our latest ${formatCategoryName(slug).toLowerCase()}`,
    }
  );
}

function getTitle(slug: string, team?: string) {
  const info = getCategoryInfo(slug);
  const key = teamKey(team);
  if (!key) return info;
  const teamName = TEAM_NAMES[key] ?? formatCategoryName(team ?? "");
  return { ...info, title: `${teamName} ${info.title}` };
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const { team } = await searchParams;
  const { title, description } = getTitle(slug, team);
  return { title, description };
}

// DB may store the team as "redbull" or "red-bull" → try both
async function fetchProducts(slug: string, team?: string): Promise<Product[]> {
  const key = teamKey(team);
  if (!key) return getProductsByCategory(slug);

  const variants = Array.from(
    new Set([
      key, // redbull
      key === "redbull" ? "red-bull" : key, // red-bull
      (team ?? "").toLowerCase(), // exactly as in URL
    ])
  );

  for (const v of variants) {
    const items = await getProductsByCategory(slug, v);
    if (items.length > 0) return items;
  }
  return [];
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { team } = await searchParams;
  const { title, description } = getTitle(slug, team);

  let products: Product[] = [];

  try {
    products = await fetchProducts(slug, team);
  } catch (err) {
    console.error(`[CategoryPage] Failed to fetch "${slug}" (${team ?? "all"}):`, err);
  }

  return (
    <div className="min-h-screen flex flex-col px-6">
      {/* ── Header ── */}
      <div className="bg-linear-to-b from-secondary/50 to-background border-b">
        <div className="container py-2 md:py-2">
          <h1 className="font-display text-2xl md:text-5xl font-extrabold mb-3">
            {title}
          </h1>
          <p className="text-muted-foreground text-sm md:text-xl">{description}</p>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="container py-2 flex-1">
        {products.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {products.length} {products.length === 1 ? "item" : "items"}
            </p>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product, i) => (
                <JerseyCard
                  key={product._id}
                  product={product}
                  priority={i < 4}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg font-medium">
              No products in this category yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}