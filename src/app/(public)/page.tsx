import type { Metadata } from "next";
import { HomeContent } from "@/components/public/HomeContent";
import { FaqJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/seo";
import { FAQS } from "@/lib/faq";

export const metadata: Metadata = {
  title: "Figaro Barbershop Leucadia | Best Barber in Encinitas, CA",
  description:
    "Figaro Barbershop Leucadia — premium haircuts, fades, beard trims & hot towel shaves in Encinitas, CA. Hispanic-owned, walk-ins welcome, organic products. Book your cut today.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Figaro Barbershop Leucadia | Best Barber in Encinitas, CA",
    description:
      "Where style meets tradition. Premium haircuts, fades, beard trims & hot towel shaves in Leucadia, Encinitas. Walk-ins welcome.",
    url: SITE_URL,
  },
};

export default function HomePage() {
  return (
    <>
      <FaqJsonLd faqs={[...FAQS]} />
      <HomeContent />
    </>
  );
}
