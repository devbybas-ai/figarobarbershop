import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Figaro Barbershop Leucadia",
  description:
    "How Figaro Barbershop Leucadia collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="bg-figaro-cream py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-figaro-black sm:text-4xl">
          Privacy Policy
        </h1>
        <div className="mt-3 h-px w-16 bg-figaro-gold" />
        <p className="mt-4 text-sm text-figaro-black/50">Last updated: March 9, 2026</p>

        <div className="mt-8 space-y-8 text-figaro-black/80">
          <div>
            <h2 className="text-lg font-semibold text-figaro-black">Information We Collect</h2>
            <p className="mt-2 leading-relaxed">
              When you visit Figaro Barbershop Leucadia or use our website, we may collect the
              following information:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1 leading-relaxed">
              <li>
                Name, email address, and phone number (provided via our intake form or booking
                system)
              </li>
              <li>Preferred barber and service preferences</li>
              <li>Allergy and skin sensitivity information (for your safety)</li>
              <li>How you heard about us (referral source)</li>
              <li>Any notes you choose to share with us</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-figaro-black">How We Use Your Information</h2>
            <ul className="mt-2 list-inside list-disc space-y-1 leading-relaxed">
              <li>To provide and improve our barbershop services</li>
              <li>To manage appointments and communicate with you about your bookings</li>
              <li>To ensure your safety by noting allergies or sensitivities</li>
              <li>To send appointment confirmations and reminders</li>
              <li>To understand how clients find us and improve our outreach</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-figaro-black">
              How We Protect Your Information
            </h2>
            <p className="mt-2 leading-relaxed">
              We take the security of your personal information seriously. Your data is stored
              securely and is only accessible to authorized staff members who need it to provide you
              with services. We do not sell, trade, or rent your personal information to third
              parties.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-figaro-black">Data Retention</h2>
            <p className="mt-2 leading-relaxed">
              We retain your client profile information as long as you remain an active client. If
              you request deletion of your data, we will remove your personal information from our
              active systems. Some records may be retained for business and legal compliance
              purposes.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-figaro-black">Your Rights</h2>
            <p className="mt-2 leading-relaxed">You have the right to:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 leading-relaxed">
              <li>Request access to the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of any marketing communications</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-figaro-black">Photos &amp; Media</h2>
            <p className="mt-2 leading-relaxed">
              We may photograph haircuts and styles for our portfolio and social media with your
              verbal consent. We never publish photos of minors. You may request removal of any
              photo featuring you at any time.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-figaro-black">Contact Us</h2>
            <p className="mt-2 leading-relaxed">
              If you have questions about this privacy policy or wish to exercise your rights,
              please contact us at the shop or through our{" "}
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
