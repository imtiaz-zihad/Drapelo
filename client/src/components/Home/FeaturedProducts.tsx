import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { getFeaturedProducts } from "@/services/api";
import { Product } from "@/types/product";
import JerseyCard from "../Common/JerseyCard";

const MAX_PRODUCTS = 10;

const TEAM_NAMES: Record<string, string> = {
  ferrari: "Ferrari",
  redbull: "Red Bull",
  "red-bull": "Red Bull",
  mercedes: "Mercedes",
};

const formatTeam = (s: string) =>
  TEAM_NAMES[s.toLowerCase()] ??
  s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

// Same card for 1, 2 or 3 products: big square image left (42%), details right.
function Spotlight({ product, priority }: { product: Product; priority?: boolean }) {
  const image = product.images?.[0];
  const off =
    product.originalPrice > product.discountedPrice
      ? Math.round(
          ((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100
        )
      : 0;

  return (
    <div className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-2xl border border-border/60 bg-card md:grid-cols-[42%_1fr] xl:max-w-none">
      {/* square image: grows with the card, never cropped */}
      <Link
        href={`/product/${product._id}`}
        className="relative block aspect-square bg-secondary"
      >
        {image && (
          <Image
            src={image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 400px, (min-width: 768px) 380px, 100vw"
            className="object-cover"
          />
        )}
        {off > 0 && (
          <span className="absolute left-3 top-3 rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
            -{off}%
          </span>
        )}
      </Link>

      <div className="flex flex-col justify-center gap-3 p-5 md:p-6">
        {product.subcategory && (
          <span className="w-fit rounded-full bg-primary/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
            {formatTeam(product.subcategory)}
          </span>
        )}

        <h3 className="font-display text-2xl uppercase leading-tight md:text-3xl">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-extrabold text-primary md:text-3xl">
            ৳{product.discountedPrice.toLocaleString()}
          </span>
          {off > 0 && (
            <span className="text-base text-muted-foreground line-through">
              ৳{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>✔ Premium racing-inspired finish</li>
          <li>
            ✔ Sizes {product.sizes?.[0] ?? "S"} to{" "}
            {product.sizes?.[product.sizes.length - 1] ?? "3XL"}
          </li>
          <li>✔ Cash on Delivery · all over Bangladesh</li>
        </ul>

        <Link
          href={`/product/${product._id}`}
          className="mt-1 inline-flex h-11 w-fit items-center justify-center gap-2 rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Order Now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default async function FeaturedProducts() {
  let featured: Product[] = [];

  try {
    featured = (await getFeaturedProducts()).slice(0, MAX_PRODUCTS);
  } catch (err) {
    console.error("FeaturedProducts fetch failed:", err);
  }

  const count = featured.length;

  const gridClass =
    count <= 4
      ? "grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4"
      : "grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5";

  return (
    <section className="py-6 md:py-10" aria-labelledby="popular-jackets">
      <div className="container">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2
            id="popular-jackets"
            className="flex items-center gap-3 text-2xl md:text-3xl"
          >
            <span className="h-7 w-1.5 -skew-x-12 bg-primary" aria-hidden />
            Popular Jackets
          </h2>

          <Link
            href="/category/jacket"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {count === 0 ? (
          <div className="rounded-3xl border border-dashed bg-card py-16 text-center">
            <Sparkles className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-muted-foreground">No featured products yet.</p>
            <p className="text-sm text-muted-foreground/60">
              Add products from the admin panel.
            </p>
          </div>
        ) : count <= 3 ? (
          <div className="grid gap-4 xl:grid-cols-2 xl:gap-6">
            {featured.map((product, i) => {
              // 3rd card: sits below, centered between the top two (xl only)
              if (count === 3 && i === 2) {
                return (
                  <div
                    key={product._id}
                    className="xl:col-span-2 xl:flex xl:justify-center"
                  >
                    {/* half width minus half of the gap-6 (1.5rem) */}
                    <div className="w-full xl:w-[calc(50%-0.75rem)]">
                      <Spotlight product={product} />
                    </div>
                  </div>
                );
              }
              return (
                <Spotlight key={product._id} product={product} priority={i === 0} />
              );
            })}
          </div>
        ) : (
          <div className={`grid ${gridClass}`}>
            {featured.map((product, i) => (
              <JerseyCard key={product._id} product={product} priority={i < 5} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}