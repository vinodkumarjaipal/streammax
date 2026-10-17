import { absoluteUrl, siteUrl } from "@/lib/site";

export default async function sitemap() {
  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/movies"),
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/tv-shows"),
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/anime"),
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}