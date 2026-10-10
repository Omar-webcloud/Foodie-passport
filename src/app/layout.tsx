import "./globals.css";
import "@fontsource/noto-sans-bengali/400.css";
import "@fontsource/noto-sans-bengali/700.css";
import type { Metadata } from "next";

import { siteOrigin } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: "Foodie Passport | Taste the Flavours of Bangladesh",
  description: "Discover regional Bangladeshi dishes, track foods tried across all 64 districts, and share your Bangladesh Food Passport.",
  applicationName: "Foodie Passport",
  keywords: [
    "Bangladesh food",
    "Bangladeshi cuisine",
    "regional food",
    "Bangladesh districts",
    "food passport",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/Bangladesh_Passport_Emblem.png", type: "image/png" }],
    apple: "/Bangladesh_Passport_Emblem.png",
  },
  openGraph: {
    title: "Foodie Passport | Taste the Flavours of Bangladesh",
    description: "Discover regional Bangladeshi dishes, track foods tried across all 64 districts, and share your Bangladesh Food Passport.",
    url: "/",
    siteName: "Foodie Passport",
    locale: "en_BD",
    type: "website",
    images: [{
      url: "/api/og?foods=0",
      width: 1200,
      height: 630,
      alt: "Bangladesh Food Passport with its district progress map",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Foodie Passport | Taste the Flavours of Bangladesh",
    description: "Discover regional Bangladeshi dishes, track foods tried across all 64 districts, and share your Bangladesh Food Passport.",
    images: ["/api/og?foods=0"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
