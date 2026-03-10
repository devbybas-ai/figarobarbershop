import { BUSINESS, SITE_URL } from "@/lib/seo";

/** BarberShop + LocalBusiness JSON-LD for site-wide structured data */
export function BarberShopJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["BarberShop", "LocalBusiness"],
    "@id": `${SITE_URL}/#barbershop`,
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    description: BUSINESS.description,
    url: SITE_URL,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    priceRange: BUSINESS.priceRange,
    currenciesAccepted: "USD",
    paymentAccepted: "Cash, Credit Card, Debit Card",
    image: `${SITE_URL}/images/shop-chairs.webp`,
    logo: `${SITE_URL}/images/figaro-logo.avif`,
    photo: [
      `${SITE_URL}/images/shop-chairs.webp`,
      `${SITE_URL}/images/shop-interior.webp`,
      `${SITE_URL}/images/shop-wall.webp`,
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.state,
      postalCode: BUSINESS.address.zip,
      addressCountry: BUSINESS.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS.geo.latitude,
      longitude: BUSINESS.geo.longitude,
    },
    hasMap: `https://www.google.com/maps?q=${BUSINESS.geo.latitude},${BUSINESS.geo.longitude}`,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "08:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "09:00",
        closes: "15:00",
      },
    ],
    sameAs: [BUSINESS.social.instagram, BUSINESS.social.facebook],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: BUSINESS.rating.value,
      bestRating: BUSINESS.rating.bestRating,
      ratingCount: BUSINESS.rating.count,
    },
    areaServed: BUSINESS.areaServed.map((area) => ({
      "@type": "City",
      name: area,
    })),
    founder: {
      "@type": "Person",
      name: "Ricardo",
      jobTitle: "Master Barber & Owner",
    },
    foundingDate: BUSINESS.founded,
    knowsLanguage: ["English", "Spanish"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/** Service JSON-LD for the services page */
export function ServicesJsonLd({
  services,
}: {
  services: { name: string; description: string | null; price: number; duration: number }[];
}) {
  const schema = services.map((service) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description ?? `${service.name} at Figaro Barbershop Leucadia`,
    provider: {
      "@type": "BarberShop",
      "@id": `${SITE_URL}/#barbershop`,
      name: BUSINESS.name,
    },
    areaServed: {
      "@type": "City",
      name: "Encinitas",
      containedInPlace: {
        "@type": "State",
        name: "California",
      },
    },
    offers: {
      "@type": "Offer",
      price: service.price.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  }));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/** Person JSON-LD for individual barber profile pages */
export function BarberJsonLd({
  name,
  role,
  image,
  description,
  slug,
}: {
  name: string;
  role: string;
  image: string;
  description: string;
  slug: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: role,
    image: `${SITE_URL}${image}`,
    description,
    url: `${SITE_URL}/barbers/${slug}`,
    worksFor: {
      "@type": "BarberShop",
      "@id": `${SITE_URL}/#barbershop`,
      name: BUSINESS.name,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/** WebSite JSON-LD for sitelinks search box */
export function WebSiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BUSINESS.name,
    url: SITE_URL,
    publisher: {
      "@type": "Organization",
      name: BUSINESS.name,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/figaro-logo.avif`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/** FAQPage JSON-LD for AI engines and rich snippets */
export function FaqJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/** BreadcrumbList JSON-LD */
export function BreadcrumbJsonLd({ items }: { items: { name: string; href: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
