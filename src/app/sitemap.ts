import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://vvslagos.com";
  const routes = [
    "",
    "/awards",
    "/future-labs",
    "/future-labs/apply",
    "/rsvp",
    "/community",
    "/tickets",
    "/vvs-2026",
    "/afterparty",
    "/artexhibition",
    "/collectors-day",
    "/film-experience",
    "/foundersevent",
    "/panels",
    "/popup",
    "/runway",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
