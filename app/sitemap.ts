import type { MetadataRoute } from "next";
import { VALID_LANGS } from "@/lib/languages";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://skydrive.web.id";
  const now = new Date();

  // Root domain entry
  const rootEntry: MetadataRoute.Sitemap[number] = {
    url: baseUrl,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1.0,
    alternates: {
      languages: {
        id: `${baseUrl}/id`,
        en: `${baseUrl}/en`,
        ja: `${baseUrl}/ja`,
        zh: `${baseUrl}/zh`,
        ko: `${baseUrl}/ko`,
        "x-default": `${baseUrl}/en`,
      },
    },
  };

  // Localized landing page entries
  const langEntries: MetadataRoute.Sitemap = VALID_LANGS.map((lang) => ({
    url: `${baseUrl}/${lang}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: lang === "id" || lang === "en" ? 0.95 : 0.85,
    alternates: {
      languages: {
        id: `${baseUrl}/id`,
        en: `${baseUrl}/en`,
        ja: `${baseUrl}/ja`,
        zh: `${baseUrl}/zh`,
        ko: `${baseUrl}/ko`,
        "x-default": `${baseUrl}/en`,
      },
    },
  }));

  // Legal & compliance entries
  const legalEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return [rootEntry, ...langEntries, ...legalEntries];
}

