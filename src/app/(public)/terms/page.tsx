import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Figaro Barbershop Leucadia",
  description: "Terms and conditions for using Figaro Barbershop Leucadia services and website.",
};

export default function TermsPage() {
  return (
    <section className="bg-figaro-cream py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-figaro-black sm:text-4xl">
          Terms of Service
        </h1>
        <div className="mt-3 h-px w-16 bg-figaro-gold" />
        <p className="mt-4 text-sm text-figaro-black/50">Last updated: March 9, 2026</p>

        <div className="mt-8 space-y-8 text-figaro-black/80">
          <div>
            <h2 className="text-lg font-semibold text-figaro-black">Services</h2>
            <p className="mt-2 leading-relaxed">
              Figaro Barbershop Leucadia provides professional barbering services including
              haircuts, beard trims, shaves, and related grooming services. All services are subject
              to availability and barber schedules.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-figaro-black">Appointments &amp; Walk-ins</h2>
            <p className="mt-2 leading-relaxed">
              We accept both booked appointments and walk-in clients. Booked appointments are given
              priority. Walk-in availability depends on current demand and barber schedules. We
              recommend booking in advance to guarantee your preferred time and barber.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-figaro-black">Pricing</h2>
            <p className="mt-2 leading-relaxed">
              Service prices are listed on our{" "}
              <a href="/services" className="font-medium text-figaro-gold hover:underline">
                services page
              </a>
              . Prices are subject to change. The price displayed at the time of booking or service
              will be honored. Additional services requested during your visit will be charged at
              the current listed price.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-figaro-black">Payment</h2>
            <p className="mt-2 leading-relaxed">
              We accept cash and major credit/debit cards. Payment is expected at the time of
              service. Tips are appreciated but not required.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-figaro-black">Client Conduct</h2>
            <p className="mt-2 leading-relaxed">
              We strive to create a welcoming environment for everyone. We reserve the right to
              refuse service to anyone who is disruptive, disrespectful, or creates an unsafe
              environment for our staff or other clients.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-figaro-black">Liability</h2>
            <p className="mt-2 leading-relaxed">
              While we take every precaution to provide safe, high-quality services, Figaro
              Barbershop Leucadia is not liable for adverse reactions to products used during
              services. Please inform your barber of any allergies or skin sensitivities before your
              service begins. This is why we ask about allergies on our intake form.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-figaro-black">Website Use</h2>
            <p className="mt-2 leading-relaxed">
              This website is provided for informational purposes and to facilitate booking. You
              agree to provide accurate information when using our intake form and booking system.
              Misuse of the website or submission of false information may result in account
              restriction.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-figaro-black">Changes to These Terms</h2>
            <p className="mt-2 leading-relaxed">
              We may update these terms from time to time. Continued use of our services or website
              after changes constitutes acceptance of the updated terms.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-figaro-black">Contact</h2>
            <p className="mt-2 leading-relaxed">
              Questions about these terms? Visit us at the shop or reach out through our{" "}
              <a href="/contact" className="font-medium text-figaro-gold hover:underline">
                contact page
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
