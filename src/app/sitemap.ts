import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/config";
import { DOC_KINDS } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ["", "/features", "/templates", "/pricing", "/about", "/contact", "/legal/privacy", "/legal/terms", "/legal/cookies", "/sign-in", "/sign-up"];
  return [
    ...staticRoutes.map((route) => ({
      url: `${APP_URL}${route}`,
      lastModified: now,
      changeFrequency: (route === "" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: route === "" ? 1 : 0.7,
    })),
    ...DOC_KINDS.map((kind) => ({
      url: `${APP_URL}/templates/${kind.kind}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
