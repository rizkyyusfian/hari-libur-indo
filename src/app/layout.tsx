import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/providers/theme-provider";
import { Analytics } from "@vercel/analytics/next";
import { absoluteUrl, SITE_NAME, SITE_ORIGIN } from "@/lib/site";
import "./globals.css";

const defaultTitle = "Kalender Hari Libur Indonesia";
const defaultDescription =
  "Kalender hari libur nasional, cuti bersama, dan libur regional Papua Barat Daya untuk membantu merencanakan waktu libur.";

export const metadata: Metadata = {
  metadataBase: SITE_ORIGIN,
  title: {
    default: defaultTitle,
    template: `%s | ${SITE_NAME}`,
  },
  description: defaultDescription,
  applicationName: SITE_NAME,
  authors: [{ name: "Rizky Yusfian", url: "https://rizkyyusfian.tech" }],
  creator: "Rizky Yusfian",
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE_NAME,
    title: defaultTitle,
    description: defaultDescription,
    url: SITE_ORIGIN,
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [absoluteUrl("/opengraph-image")],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff8ed" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
