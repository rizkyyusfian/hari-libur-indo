import type { MetadataRoute } from "next";
import {
  absoluteUrl,
  PUBLIC_PAGE_LAST_MODIFIED,
} from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      lastModified: PUBLIC_PAGE_LAST_MODIFIED.home,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: PUBLIC_PAGE_LAST_MODIFIED.about,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
