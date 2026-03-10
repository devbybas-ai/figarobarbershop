import type { Metadata } from "next";
import { db } from "@/lib/db";
import { BarberJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/seo";

const BARBER_IMAGES: Record<string, string> = {
  ricardo: "/images/gallery/Ricardo.webp",
  zeke: "/images/gallery/Zeke.webp",
  bryam: "/images/gallery/Bryam.webp",
  johnny: "/images/gallery/Johnny.webp",
  david: "/images/gallery/David.webp",
  austin: "/images/gallery/Austin.webp",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const slugLower = slug.toLowerCase();

  const barber = await db.barber.findFirst({
    where: {
      firstName: { equals: slug, mode: "insensitive" },
      isActive: true,
    },
    select: { firstName: true, bio: true, title: true, specialties: true },
  });

  if (!barber) {
    return { title: "Barber Not Found" };
  }

  const name = barber.firstName;
  const role = barber.title ?? "Barber";
  const specialties = barber.specialties ?? [];
  const image = BARBER_IMAGES[slugLower];
  const specialtiesText = specialties.join(", ");

  const title = `${name} — ${role} at Figaro Barbershop Leucadia`;
  const description = `Book with ${name}, ${role.toLowerCase()} at Figaro Barbershop in Leucadia, Encinitas. Specializing in ${specialtiesText}. View portfolio, schedule & book online.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/barbers/${slugLower}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/barbers/${slugLower}`,
      images: image
        ? [
            {
              url: image,
              alt: `${name} — ${role} at Figaro Barbershop Leucadia`,
            },
          ]
        : undefined,
    },
  };
}

export default async function BarberProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const slugLower = slug.toLowerCase();
  const image = BARBER_IMAGES[slugLower] ?? "";
  const name = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();

  const barberData = await db.barber.findFirst({
    where: {
      firstName: { equals: slug, mode: "insensitive" },
      isActive: true,
    },
    select: { title: true },
  });
  const role = barberData?.title ?? "Barber";

  return (
    <>
      <BarberJsonLd
        name={name}
        role={role}
        image={image}
        description={`${name} is a ${role.toLowerCase()} at Figaro Barbershop Leucadia in Encinitas, CA.`}
        slug={slugLower}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Our Barbers", href: "/barbers" },
          { name, href: `/barbers/${slugLower}` },
        ]}
      />
      {children}
    </>
  );
}
