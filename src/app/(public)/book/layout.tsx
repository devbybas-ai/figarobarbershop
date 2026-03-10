import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Book your haircut, fade, beard trim, or hot towel shave at Figaro Barbershop Leucadia. Choose your barber, pick a time, and walk in looking your best. Online booking available.",
  alternates: {
    canonical: `${SITE_URL}/book`,
  },
  openGraph: {
    title: "Book an Appointment | Figaro Barbershop Leucadia",
    description:
      "Book your next haircut at Figaro Barbershop in Leucadia, Encinitas. Choose your barber and time online.",
    url: `${SITE_URL}/book`,
  },
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
