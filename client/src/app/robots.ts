import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://drapelo.shop";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/login", "/checkout", "/track-order"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}