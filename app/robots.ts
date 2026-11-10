import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://skydrive.web.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/id", "/en", "/ja", "/zh", "/ko", "/privacy", "/terms"],
        disallow: ["/dashboard/", "/api/", "/login", "/register"],
      },
      // Allow leading AI Search & Answer Engine bots for optimal GEO citations
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "Claude-Web",
          "Google-Extended",
          "Applebot",
          "Bingbot",
        ],
        allow: ["/", "/id", "/en", "/ja", "/zh", "/ko", "/privacy", "/terms", "/llms.txt", "/llms-full.txt"],
        disallow: ["/dashboard/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

