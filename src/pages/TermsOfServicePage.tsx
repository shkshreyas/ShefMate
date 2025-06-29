import { PageLayout } from "@/components/layouts/PageLayout";

export function TermsOfServicePage() {
  return (
    <PageLayout
      title="Terms of Service"
      description="Read our terms and conditions for using ShefMate's services."
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
          <p>
            By accessing or using ShefMate's platform, you agree to be bound by these Terms of Service 
            and all applicable laws and regulations. If you do not agree with any of these terms, you 
            are prohibited from using or accessing this platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
          <p>
            Permission is granted to temporarily use ShefMate's platform for personal, non-commercial 
            purposes. This is the grant of a license, not a transfer of title, and under this license 
            you may not:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to decompile or reverse engineer any software contained on the platform</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
          <p>
            To access certain features of the platform, you must register for an account. You agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>Accept responsibility for all activities under your account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">4. Booking and Payment Terms</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Booking Process</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>All bookings are subject to chef availability</li>
              <li>Bookings must be made at least 24 hours in advance</li>
              <li>Cancellations must be made at least 12 hours before the scheduled time</li>
              <li>Late cancellations may be subject to fees</li>
            </ul>

            <h3 className="text-xl font-semibold">Payment Terms</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>All prices are in the local currency unless otherwise specified</li>
              <li>Payment is processed securely through our payment partners</li>
              <li>Refunds are processed according to our cancellation policy</li>
              <li>Additional charges may apply for special requests or modifications</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">5. Chef Services</h2>
          <p>
            Our platform connects users with professional chefs. While we verify chef credentials, we 
            are not responsible for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The quality of food preparation</li>
            <li>Chef conduct during service</li>
            <li>Any food allergies or dietary restrictions</li>
            <li>Equipment or ingredient availability</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">6. User Conduct</h2>
          <p>
            Users agree not to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Violate any applicable laws or regulations</li>
            <li>Impersonate any person or entity</li>
            <li>Harass, abuse, or harm others</li>
            <li>Interfere with the proper functioning of the platform</li>
            <li>Attempt to gain unauthorized access to any portion of the platform</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">7. Intellectual Property</h2>
          <p>
            The platform and its original content, features, and functionality are owned by ShefMate 
            and are protected by international copyright, trademark, patent, trade secret, and other 
            intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">8. Limitation of Liability</h2>
          <p>
            In no event shall ShefMate be liable for any damages arising out of the use or inability 
            to use the platform, including but not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Direct, indirect, incidental, or consequential damages</li>
            <li>Loss of profits, data, or business interruption</li>
            <li>Personal injury or property damage</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any 
            material changes by posting the new terms on this page and updating the effective date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">10. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <div className="mt-4 space-y-2">
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:contact@shefmate.com" className="text-primary hover:underline">
                contact@shefmate.com
              </a>
            </p>
            <p>
              <strong>Phone:</strong>{' '}
              <a href="tel:+916202372739" className="text-primary hover:underline">
                +91 6202372739
              </a>
            </p>
          </div>
        </section>

        <section>
          <p className="text-sm text-muted-foreground">
            Last updated: March 20, 2025
          </p>
        </section>
      </div>
    </PageLayout>
  );
} 