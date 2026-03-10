import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff Login",
  description: "Figaro Barbershop staff login portal.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
