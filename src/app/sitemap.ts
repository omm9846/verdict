import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://verdict-xi-olive.vercel.app";
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/dashboard`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/brand`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/gallery`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/terms-of-service`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
