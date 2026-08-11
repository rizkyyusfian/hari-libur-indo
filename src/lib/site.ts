import type { Metadata } from "next";

export const SITE_NAME = "Hari Libur Indo";
export const SITE_ORIGIN = new URL("https://hari-libur-indo.vercel.app");

export const PUBLIC_PAGE_LAST_MODIFIED = {
  home: new Date("2026-08-11T00:00:00.000Z"),
  about: new Date("2026-08-11T00:00:00.000Z"),
} as const;

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_ORIGIN).toString();
}

export function publicMetadata(input: {
  path: string;
  title: string;
  description: string;
}): Metadata {
  const url = absoluteUrl(input.path);
  const imageUrl = absoluteUrl("/opengraph-image");

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: SITE_NAME,
      title: input.title,
      description: input.description,
      url,
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [imageUrl],
    },
  };
}
