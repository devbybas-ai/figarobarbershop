"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { InstagramFeed } from "@/components/public/InstagramFeed";
const REVIEWS = [
  {
    name: "Leonard H",
    rating: 5,
    text: "Love this place, love the old style look and the warm welcome and banter from the lads who cut your hair.",
  },
  {
    name: "Jack T",
    rating: 5,
    text: "I will definitely be getting my hair cut here from now on. Great experience, great cut.",
  },
  {
    name: "Phillip L",
    rating: 5,
    text: "I like the friendly acquaintance and the quality cut.",
  },
  {
    name: "Russell T",
    rating: 5,
    text: "I really like this Barbershop. The overall energy of the barbers and shop is chill and positive. Ricardo is great.",
  },
  {
    name: "James W",
    rating: 5,
    text: "Austin was awesome.",
  },
  {
    name: "Ed S",
    rating: 5,
    text: "Good job Noah.",
  },
];

const HIGHLIGHTS = [
  {
    label: "Hispanic-Owned",
    icon: "M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418",
  },
  {
    label: "Organic Products",
    icon: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z",
  },
  {
    label: "Walk-Ins Welcome",
    icon: "M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z",
  },
  {
    label: "Pet-Friendly",
    icon: "M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m7.848-9.775H5.904m7.848 0a3 3 0 0 1 .735 1.309l1.054 3.686a3 3 0 0 1-.26 2.422M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] items-start pt-24 overflow-hidden bg-figaro-dark sm:items-center sm:pt-0">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/shop-chairs.jpg"
            alt="Figaro Barbershop Leucadia interior"
            className="h-full w-full object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-figaro-dark via-figaro-dark/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-figaro-dark/60 via-transparent to-transparent" />
        </div>

        {/* Teal accent stripe at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-figaro-teal via-figaro-gold to-figaro-teal" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-figaro-teal" />
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-figaro-teal">
                  Leucadia &middot; Encinitas, CA
                </p>
              </div>
            </motion.div>

            <motion.h1
              className="mt-6 text-5xl font-bold tracking-tight text-figaro-cream sm:text-7xl lg:text-8xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              FIGARO
              <span className="block bg-gradient-to-r from-figaro-gold to-figaro-gold-light bg-clip-text text-transparent">
                BARBERSHOP
              </span>
            </motion.h1>

            <motion.p
              className="mt-6 max-w-md text-lg leading-relaxed text-figaro-cream/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              Where Style Meets Tradition. Every haircut is a blend of artistry and care, crafting
              confidence one cut at a time.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Link
                href="/barbers"
                className="rounded-sm bg-figaro-gold px-8 py-3.5 text-base font-semibold text-figaro-dark transition-all hover:bg-figaro-gold-light hover:shadow-lg hover:shadow-figaro-gold/20"
              >
                Meet the Crew
              </Link>
              <Link
                href="/book"
                className="rounded-sm border border-figaro-teal bg-figaro-teal px-8 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:bg-figaro-teal-dark hover:shadow-lg hover:shadow-figaro-teal/25 sm:border-figaro-teal/50 sm:bg-transparent sm:text-figaro-teal sm:hover:border-figaro-teal sm:hover:bg-figaro-teal sm:hover:text-white"
              >
                Book Your Cut
              </Link>
            </motion.div>

            {/* Highlight badges */}
            <motion.div
              className="mt-10 flex flex-wrap gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              {HIGHLIGHTS.map((h) => (
                <span
                  key={h.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-figaro-cream/10 bg-figaro-cream/5 px-3 py-1.5 text-xs font-medium text-figaro-cream/60"
                >
                  <svg
                    className="h-3.5 w-3.5 text-figaro-teal"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={h.icon} />
                  </svg>
                  {h.label}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-figaro-cream py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true, margin: "-20px" }}
          >
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-figaro-teal" />
              <p className="text-sm font-semibold uppercase tracking-widest text-figaro-teal">
                Reviews
              </p>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <h2 className="text-3xl font-bold tracking-tight text-figaro-black sm:text-4xl">
                What Our Clients Say
              </h2>
              <a
                href="https://www.fresha.com/a/figaro-barbershop-leucadia-encinitas-ee-uu-114-leucadia-boulevard-t5d200mp?reviews=true"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-2 transition-opacity hover:opacity-80 sm:flex"
              >
                <div className="flex text-figaro-gold">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-lg font-bold text-figaro-black">4.9</span>
                <span className="text-sm text-figaro-black/50 underline decoration-figaro-black/20 underline-offset-2">
                  (36 reviews)
                </span>
              </a>
            </div>
          </motion.div>

          <motion.div
            className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true, margin: "-10px" }}
          >
            {REVIEWS.map((review, index) => (
              <div
                key={review.name}
                className={`rounded-sm border bg-white p-6 transition-all hover:shadow-lg ${
                  index % 2 === 0
                    ? "border-figaro-black/10 hover:border-figaro-gold/30 hover:shadow-figaro-gold/5"
                    : "border-figaro-black/10 hover:border-figaro-teal/30 hover:shadow-figaro-teal/5"
                }`}
              >
                <div className="flex text-figaro-gold">
                  {Array.from({ length: review.rating }, (_, i) => (
                    <svg
                      key={i}
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-figaro-black/70">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${
                      index % 2 === 0 ? "bg-figaro-gold" : "bg-figaro-teal"
                    }`}
                  >
                    {review.name[0]}
                  </div>
                  <span className="text-sm font-medium text-figaro-black">{review.name}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* Instagram Feed */}
      <InstagramFeed />

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-figaro-teal py-16">
        {/* Shop photo behind teal overlay */}
        <div className="absolute inset-0">
          <img
            src="/images/shop-wall.jpg"
            alt=""
            className="h-full w-full object-cover opacity-20"
            loading="lazy"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-figaro-teal-dark/90 to-figaro-teal/90" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-figaro-gold via-figaro-gold-light to-figaro-gold" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true, margin: "-10px" }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready for a Fresh Cut?
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Book online or walk in — we&apos;re ready when you are.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/book"
                className="rounded-sm bg-figaro-gold px-8 py-3.5 text-base font-semibold text-figaro-dark transition-colors hover:bg-figaro-gold-light"
              >
                Book Now
              </Link>
              <a
                href="tel:+17607512008"
                className="rounded-sm border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
              >
                Call (760) 751-2008
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
