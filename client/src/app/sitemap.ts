import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://drapelo.shop";
const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: SITE, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/category/jacket`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/category/jacket?team=ferrari`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/category/jacket?team=redbull`, changeFrequency: "weekly", priority: 0.8 },
  ];

  try {
    // adjust to your API's products endpoint/response shape
    const res = await fetch(`${API}/products`, { next: { revalidate: 3600 } });
    const data = await res.json();
    const products: { _id: string }[] = Array.isArray(data) ? data : data.products ?? [];

    for (const p of products) {
      pages.push({
        url: `${SITE}/product/${p._id}`,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
  } catch {
    /* sitemap still works with static pages */
  }

  return pages;
}