import { absoluteUrl, SITE_NAME } from "./site";

const context = "https://schema.org";

export function websiteJsonLd() {
  return {
    "@context": context,
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    url: absoluteUrl("/"),
    name: SITE_NAME,
    description:
      "Kalender hari libur nasional, cuti bersama, dan libur regional Papua Barat Daya.",
    inLanguage: "id-ID",
  } as const;
}

export function webApplicationJsonLd(year: number) {
  return {
    "@context": context,
    "@type": "WebApplication",
    "@id": absoluteUrl("/#web-application"),
    url: absoluteUrl("/"),
    name: `Kalender Hari Libur Indonesia ${year}`,
    description: `Kalender interaktif hari libur nasional, cuti bersama, dan libur regional Papua Barat Daya tahun ${year}.`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    inLanguage: "id-ID",
    featureList: [
      `Kalender hari libur nasional dan cuti bersama ${year}`,
      `Kalender hari libur regional Papua Barat Daya ${year}`,
      "Perhitungan long weekend",
      "Ekspor kalender ke gambar dan PDF",
    ],
  } as const;
}

export function aboutPageJsonLd() {
  return {
    "@context": context,
    "@type": "WebPage",
    "@id": absoluteUrl("/about#webpage"),
    url: absoluteUrl("/about"),
    name: `Tentang ${SITE_NAME}`,
    description:
      "Informasi tentang sumber data, metode, dan tujuan Kalender Hari Libur Indo.",
    inLanguage: "id-ID",
    isPartOf: {
      "@id": absoluteUrl("/#website"),
    },
  } as const;
}
