import { PageLayout } from "@/components/layouts/PageLayout";

export function PrivacyPolicyPage() {
  return (
    <PageLayout
      title="Privacy Policy"
      description="Learn how we collect, use, and protect your personal information."
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Introduction</h2>
          <p>
            At ShefMate, we take your privacy seriously. This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you use our platform. Please read this 
            privacy policy carefully. If you do not agree with the terms of this privacy policy, please 
            do not access the platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Personal Information</h3>
            <p>We may collect personal information that you voluntarily provide to us when you:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Register for an account</li>
              <li>Book a chef</li>
              <li>Sign up for our newsletter</li>
              <li>Contact our support team</li>
              <li>Participate in surveys or promotions</li>
            </ul>
            <p className="mt-4">This information may include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name and contact information</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Billing and payment information</li>
              <li>Address and location details</li>
              <li>Profile information</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and maintain our services</li>
            <li>Process your bookings and payments</li>
            <li>Send you important updates and notifications</li>
            <li>Respond to your inquiries and support requests</li>
            <li>Improve our platform and services</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Information Sharing and Disclosure</h2>
          <p>
            We may share your information with:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Chefs and service providers to fulfill your bookings</li>
            <li>Payment processors to handle transactions</li>
            <li>Service providers who assist in our operations</li>
            <li>Legal authorities when required by law</li>
          </ul>
          <p className="mt-4">
            We do not sell your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal 
            information against unauthorized access, alteration, disclosure, or destruction. However, 
            no method of transmission over the Internet or electronic storage is 100% secure, and we 
            cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Object to processing of your information</li>
            <li>Withdraw consent for marketing communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Cookies and Tracking</h2>
          <p>
            We use cookies and similar tracking technologies to improve your experience on our platform. 
            You can control cookie settings through your browser preferences.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any changes by 
            posting the new policy on this page and updating the effective date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <div className="mt-4 space-y-2">
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:shkshreyaskumar@gmail.com" className="text-primary hover:underline">
                shkshreyaskumar@gmail.com
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