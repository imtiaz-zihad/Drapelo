import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.drapelo.shop";
const API = process.env.NEXT_PUBLIC_API_BASE_URL;

// Build-er shomoy Render ghumay thake, tai request-er shomoy toiri hobe
// (fetch result 1 ghonta cache hoy)
export const dynamic = "force-dynamic";

type ProductLite = { _id: string; updatedAt?: string };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: SITE, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/category/jacket`, changeFrequency: "weekly", priority: 0.9 },
    {
      url: `${SITE}/category/jacket?team=ferrari`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE}/category/jacket?team=redbull`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  try {
    const res = await fetch(`${API}/products`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Products API responded ${res.status}`);

    const data = await res.json();
    const list: ProductLite[] = Array.isArray(data)
      ? data
      : (data.products ?? data.data ?? data.items ?? []);

    for (const p of list) {
      if (!p?._id) continue;
      pages.push({
        url: `${SITE}/product/${p._id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
  } catch (err) {
    console.error("Sitemap: could not load products:", err);
  }

  return pages;
}