import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "New Client Form",
  description:
    "New to Figaro Barbershop Leucadia? Fill out our quick intake form so we can give you the best experience from day one.",
  alternates: {
    canonical: `${SITE_URL}/intake`,
  },
  robots: {
    index: false,
  },
};

export default function IntakeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
