import { describe, expect, it } from "vitest";
import {
  aboutPageJsonLd,
  webApplicationJsonLd,
  websiteJsonLd,
} from "./structured-data";

describe("structured data", () => {
  it("uses supported types and absolute identifiers", () => {
    const values = [
      websiteJsonLd(),
      webApplicationJsonLd(2026),
      aboutPageJsonLd(),
    ];

    expect(values.map((value) => value["@type"])).toEqual([
      "WebSite",
      "WebApplication",
      "WebPage",
    ]);
    expect(values.every((value) => value["@id"].startsWith("https://"))).toBe(
      true,
    );
    expect(values.every((value) => value.url.startsWith("https://"))).toBe(true);
    expect(values.every((value) => value.inLanguage === "id-ID")).toBe(true);
    expect(JSON.stringify(values)).not.toMatch(/Event|FAQPage|Organization/);
  });

  it("describes only visible calendar features for the selected year", () => {
    const value = webApplicationJsonLd(2026);

    expect(value.name).toContain("2026");
    expect(value.featureList).toEqual([
      "Kalender hari libur nasional dan cuti bersama 2026",
      "Kalender hari libur regional Papua Barat Daya 2026",
      "Perhitungan long weekend",
      "Ekspor kalender ke gambar dan PDF",
    ]);
    expect(value.applicationCategory).toBe("UtilitiesApplication");
    expect(value.operatingSystem).toBe("Web");
  });
});
