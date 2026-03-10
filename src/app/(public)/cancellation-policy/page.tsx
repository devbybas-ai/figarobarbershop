import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation Policy | Figaro Barbershop Leucadia",
  description: "Figaro Barbershop Leucadia appointment cancellation and no-show policy.",
};

export default function CancellationPolicyPage() {
  return (
    <section className="bg-figaro-cream py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-figaro-black sm:text-4xl">
          Cancellation Policy
        </h1>
        <div className="mt-3 h-px w-16 bg-figaro-gold" />
        <p className="mt-4 text-sm text-figaro-black/50">Last updated: March 9, 2026</p>

        <div className="mt-8 space-y-8 text-figaro-black/80">
          <div>
            <h2 className="text-lg font-semibold text-figaro-black">Cancellations</h2>
            <p className="mt-2 leading-relaxed">
              We understand that plans change. If you need to cancel or reschedule your appointment,
              please give us at least <strong>2 hours notice</strong> so we can offer the slot to
              another client.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-figaro-black">How to Cancel</h2>
            <p className="mt-2 leading-relaxed">
              You can cancel or reschedule by calling the shop directly or through our booking
              system. We appreciate the heads-up so our barbers can plan their day.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-figaro-black">Late Arrivals</h2>
            <p className="mt-2 leading-relaxed">
              If you arrive more than 15 minutes late for your appointment, we may need to
              reschedule you depending on the barber&apos;s availability. We do our best to
              accommodate everyone, but we also need to respect the time of clients who booked after
              you.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-figaro-black">No-Shows</h2>
            <p className="mt-2 leading-relaxed">
              Repeated no-shows without notice may affect your ability to book future appointments
              online. We keep our policy fair and flexible — just communicate with us and we&apos;ll
              work it out.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-figaro-black">Questions?</h2>
            <p className="mt-2 leading-relaxed">
              If you have any questions about cancellations or need to reschedule, don&apos;t
              hesitate to reach out through our{" "}
              <a href="/contact" className="font-medium text-figaro-gold hover:underline">
                contact page
              </a>{" "}
              or call us directly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
