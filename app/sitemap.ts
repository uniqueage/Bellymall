import type { MetadataRoute } from "next";
import { CATEGORIES } from "../src/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bellymall.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    ...CATEGORIES.map((category) => ({
      url: `${siteUrl}/stall/${category.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
