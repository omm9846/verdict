import type { MetadataRoute } from "next";
import { BOUNCES } from "@/lib/bounce-codes";
import { ALTERNATIVES } from "@/lib/alternatives";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://tryverdict.org";
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/audit`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/spoofable`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/clean`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/bounce`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/alternatives`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    // "X alternative" is where people search with budget already in hand.
    ...ALTERNATIVES.map((a) => ({
      url: `${base}/alternatives/${a.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    // One page per bounce code. These are the queries people actually type
    // when they are staring at a failed send.
    ...BOUNCES.map((b) => ({
      url: `${base}/bounce/${b.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${base}/dashboard`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/brand`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/gallery`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}
