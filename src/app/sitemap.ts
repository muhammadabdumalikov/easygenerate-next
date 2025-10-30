import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://converto.dev";

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/tools",
    "/tools/csv-to-json",
    "/tools/csv-to-excel",
    "/tools/json-formatter",
    "/tools/json-to-env",
    "/tools/csv-to-html",
    "/tools/csv-to-markdown",
    "/tools/csv-to-sql",
    "/tools/excel-to-pdf",
    "/tools/word-to-pdf",
    "/wishlist",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  return staticRoutes;
}


