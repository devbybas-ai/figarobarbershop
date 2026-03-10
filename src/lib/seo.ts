/** Centralized SEO configuration for Figaro Barbershop Leucadia */

export const SITE_URL = "https://figaroleucadia.com";

export const BUSINESS = {
  name: "Figaro Barbershop Leucadia",
  legalName: "Figaro Barbershop",
  description:
    "Premium barbershop in Leucadia, Encinitas serving the North County San Diego community. Hispanic-owned. Walk-ins welcome.",
  shortDescription:
    "Where style meets tradition. Leucadia's finest barbershop in Encinitas, California.",
  phone: "+1-760-751-2008",
  phoneDisplay: "(760) 751-2008",
  email: "info@figaroleucadia.com",
  address: {
    street: "114 Leucadia Blvd",
    city: "Encinitas",
    state: "CA",
    zip: "92024",
    country: "US",
  },
  geo: {
    latitude: 33.0581,
    longitude: -117.2929,
  },
  hours: [
    { days: "Monday-Friday", open: "09:00", close: "19:00" },
    { days: "Saturday", open: "08:00", close: "17:00" },
    { days: "Sunday", open: "09:00", close: "15:00" },
  ],
  social: {
    instagram: "https://www.instagram.com/figaroleucadia/",
    facebook: "https://www.facebook.com/figarobarbershopleucadia/",
  },
  rating: {
    value: 4.9,
    count: 36,
    bestRating: 5,
  },
  priceRange: "$$",
  founded: "2018",
  areaServed: [
    "Leucadia",
    "Encinitas",
    "Cardiff-by-the-Sea",
    "Carlsbad",
    "Solana Beach",
    "Del Mar",
    "Oceanside",
    "North County San Diego",
  ],
} as const;

export const SEO_KEYWORDS = {
  primary: [
    "barbershop Leucadia",
    "barber Encinitas",
    "haircut Encinitas",
    "barbershop near me Encinitas",
    "Figaro Barbershop",
    "barber Leucadia CA",
  ],
  services: [
    "fade haircut Encinitas",
    "skin fade Leucadia",
    "beard trim Encinitas",
    "hot towel shave Encinitas",
    "straight razor shave Leucadia",
    "men's haircut Encinitas CA",
    "taper fade Encinitas",
    "line up haircut Leucadia",
  ],
  local: [
    "Hispanic owned barbershop Encinitas",
    "walk in barbershop Leucadia",
    "best barber Leucadia",
    "barbershop North County San Diego",
    "barber near Leucadia Blvd",
    "organic products barbershop Encinitas",
  ],
} as const;

/** Merge all keyword arrays into a flat list */
export function getAllKeywords(): string[] {
  return [...SEO_KEYWORDS.primary, ...SEO_KEYWORDS.services, ...SEO_KEYWORDS.local];
}
