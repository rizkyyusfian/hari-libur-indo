import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  publicMetadata,
  PUBLIC_PAGE_LAST_MODIFIED,
  SITE_ORIGIN,
} from "./site";

describe("site metadata", () => {
  it("uses the approved canonical production origin", () => {
    expect(SITE_ORIGIN.href).toBe("https://hari-libur-indo.vercel.app/");
    expect(absoluteUrl("/about")).toBe(
      "https://hari-libur-indo.vercel.app/about",
    );
  });

  it("builds self-canonical social metadata", () => {
    const metadata = publicMetadata({
      path: "/about",
      title: "Tentang Hari Libur Indo",
      description:
        "Pelajari sumber data dan metode Kalender Hari Libur Indo.",
    });

    expect(metadata.alternates?.canonical).toBe("/about");
    expect(metadata.openGraph?.url).toBe(
      "https://hari-libur-indo.vercel.app/about",
    );
    expect(metadata.twitter && "card" in metadata.twitter ? metadata.twitter.card : undefined).toBe(
      "summary_large_image",
    );
  });

  it("keeps public page dates stable for crawl metadata", () => {
    expect(PUBLIC_PAGE_LAST_MODIFIED.home.toISOString()).toBe(
      "2026-08-11T00:00:00.000Z",
    );
    expect(PUBLIC_PAGE_LAST_MODIFIED.about.toISOString()).toBe(
      "2026-08-11T00:00:00.000Z",
    );
  });
});
