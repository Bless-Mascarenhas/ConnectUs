import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/onboarding/", "/dashboard", "/messages", "/profile", "/settings"],
      },
    ],
    sitemap: "https://connectus.vercel.app/sitemap.xml",
  };
}
