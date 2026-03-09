import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Figaro Barbershop Leucadia. Located at 114 Leucadia Blvd in Encinitas, CA.",
};

export default function ContactPage() {
  return (
    <>
      {/* Hero Banner */}
      <section className="relative flex h-48 items-center justify-center overflow-hidden bg-figaro-dark sm:h-64">
        <img
          src="/images/shop-interior.webp"
          alt="Figaro Barbershop Leucadia storefront"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-figaro-dark/40 to-figaro-dark/80" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-figaro-teal via-figaro-gold to-figaro-teal" />
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-figaro-teal" />
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-figaro-teal">
              Get In Touch
            </p>
            <div className="h-px w-8 bg-figaro-teal" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-figaro-cream sm:text-5xl">
            Contact Us
          </h1>
        </div>
      </section>

      <section className="bg-figaro-cream py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {/* Contact Info */}
            <div className="rounded-sm border border-figaro-black/10 bg-white p-8 transition-shadow hover:shadow-lg hover:shadow-figaro-teal/5">
              <div className="flex items-center gap-3">
                <div className="h-px w-6 bg-figaro-teal" />
                <h2 className="text-lg font-semibold text-figaro-black">Visit Us</h2>
              </div>
              <address className="mt-4 space-y-3 not-italic text-figaro-black/70">
                <div>
                  <p className="font-medium text-figaro-black">Figaro Barbershop Leucadia</p>
                  <a
                    href="https://maps.google.com/?q=114+Leucadia+Blvd,+Encinitas,+CA+92024"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block transition-colors hover:text-figaro-teal"
                  >
                    <p>114 Leucadia Blvd</p>
                    <p>Encinitas, CA 92024</p>
                  </a>
                </div>
                <div>
                  <p className="font-medium text-figaro-black">Phone</p>
                  <a
                    href="tel:+17607512008"
                    className="text-figaro-teal transition-colors hover:text-figaro-teal-dark"
                  >
                    (760) 751-2008
                  </a>
                </div>
                <div>
                  <p className="font-medium text-figaro-black">Email</p>
                  <a
                    href="mailto:barbarospleucadia@gmail.com"
                    className="text-figaro-teal transition-colors hover:text-figaro-teal-dark"
                  >
                    barbarospleucadia@gmail.com
                  </a>
                </div>
                <div className="flex gap-4 pt-2">
                  <a
                    href="https://www.instagram.com/figaroleucadia/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-figaro-gold transition-colors hover:text-figaro-gold-light"
                    aria-label="Follow us on Instagram"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/figaroleucadia/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-figaro-gold transition-colors hover:text-figaro-gold-light"
                    aria-label="Follow us on Facebook"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </div>
              </address>

              <div className="mt-6 flex flex-col gap-3 border-t border-figaro-black/10 pt-6 sm:flex-row">
                <Link
                  href="/book"
                  className="inline-block rounded-sm bg-figaro-gold px-5 py-2.5 text-center text-sm font-semibold text-figaro-dark transition-colors hover:bg-figaro-gold-light"
                >
                  Book Now
                </Link>
                <Link
                  href="/barbers"
                  className="inline-block rounded-sm border border-figaro-teal px-5 py-2.5 text-center text-sm font-semibold text-figaro-teal transition-colors hover:bg-figaro-teal/10"
                >
                  Meet Our Crew
                </Link>
              </div>
            </div>

            {/* Hours */}
            <div className="rounded-sm border border-figaro-black/10 bg-white p-8 transition-shadow hover:shadow-lg hover:shadow-figaro-gold/5">
              <div className="flex items-center gap-3">
                <div className="h-px w-6 bg-figaro-gold" />
                <h2 className="text-lg font-semibold text-figaro-black">Hours</h2>
              </div>
              <dl className="mt-4 space-y-2">
                {[
                  { day: "Monday", hours: "10:30 AM - 6:30 PM" },
                  { day: "Tuesday", hours: "10:30 AM - 6:30 PM" },
                  { day: "Wednesday", hours: "10:30 AM - 6:30 PM" },
                  { day: "Thursday", hours: "10:30 AM - 6:30 PM" },
                  { day: "Friday", hours: "10:30 AM - 6:30 PM" },
                  { day: "Saturday", hours: "10:00 AM - 4:00 PM" },
                  { day: "Sunday", hours: "10:00 AM - 4:00 PM" },
                ].map((item) => (
                  <div key={item.day} className="flex justify-between">
                    <dt className="text-figaro-black/70">{item.day}</dt>
                    <dd className="font-medium text-figaro-black">{item.hours}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 space-y-2 border-t border-figaro-black/10 pt-6">
                <h3 className="text-sm font-semibold text-figaro-black">Good to know</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { tag: "Pet-friendly", accent: "teal" },
                    { tag: "Kid-friendly", accent: "gold" },
                    { tag: "Wheelchair accessible", accent: "teal" },
                    { tag: "Parking available", accent: "gold" },
                    { tag: "Organic products", accent: "teal" },
                    { tag: "Hispanic-owned", accent: "gold" },
                  ].map((item) => (
                    <span
                      key={item.tag}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        item.accent === "teal"
                          ? "bg-figaro-teal/10 text-figaro-teal-dark"
                          : "bg-figaro-gold/10 text-figaro-gold"
                      }`}
                    >
                      {item.tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
