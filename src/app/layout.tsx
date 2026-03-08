import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Figaro Barbershop Leucadia",
    template: "%s | Figaro Barbershop Leucadia",
  },
  description:
    "Experience Leucadia's finest cut at Figaro Barbershop. Where style meets tradition. Hispanic-owned barbershop in Encinitas, California.",
  keywords: [
    "barbershop",
    "Leucadia",
    "Encinitas",
    "haircut",
    "beard trim",
    "shave",
    "barber",
    "Figaro",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
