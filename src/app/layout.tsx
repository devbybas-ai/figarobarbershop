import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BarberShopJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL, BUSINESS, getAllKeywords } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1a1a",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Figaro Barbershop Leucadia | Barber in Encinitas, CA",
    template: "%s | Figaro Barbershop Leucadia",
  },
  description:
    "Premium barbershop in Leucadia, Encinitas, CA. Haircuts, fades, beard trims, hot towel shaves. Hispanic-owned. Walk-ins welcome. Book online today.",
  keywords: getAllKeywords(),
  authors: [{ name: BUSINESS.name }],
  creator: BUSINESS.name,
  publisher: BUSINESS.name,
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: BUSINESS.name,
    title: "Figaro Barbershop Leucadia | Barber in Encinitas, CA",
    description:
      "Premium barbershop in Leucadia, Encinitas. Haircuts, fades, beard trims, hot towel shaves. Hispanic-owned. Walk-ins welcome.",
    images: [
      {
        url: "/images/shop-chairs.webp",
        width: 1200,
        height: 630,
        alt: "Figaro Barbershop Leucadia — interior with vintage barber chairs",
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Figaro Barbershop Leucadia | Barber in Encinitas, CA",
    description:
      "Premium barbershop in Leucadia, Encinitas. Haircuts, fades, beard trims, hot towel shaves. Walk-ins welcome.",
    images: ["/images/shop-chairs.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "barbershop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <BarberShopJsonLd />
        <WebSiteJsonLd />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-figaro-gold focus:text-figaro-black"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
