import { PageLayout } from "@/components/layouts/PageLayout";

export function CookiePolicyPage() {
  return (
    <PageLayout
      title="Cookie Policy"
      description="Learn about how we use cookies and similar technologies on ShefMate"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">What Are Cookies</h2>
          <p className="text-muted-foreground">
            Cookies are small text files that are placed on your device when you visit our website. 
            They help us provide you with a better experience by enabling us to monitor which pages 
            you find useful and which you do not.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">How We Use Cookies</h2>
          <p className="text-muted-foreground">
            We use cookies for the following purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Essential cookies: Required for the website to function properly</li>
            <li>Authentication cookies: To keep you signed in</li>
            <li>Preference cookies: To remember your settings and preferences</li>
            <li>Analytics cookies: To understand how you use our website</li>
            <li>Marketing cookies: To deliver relevant advertisements</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Types of Cookies We Use</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">Essential Cookies</h3>
              <p className="text-muted-foreground">
                These cookies are necessary for the website to function and cannot be switched off. 
                They are usually only set in response to actions made by you which amount to a request 
                for services, such as setting your privacy preferences, logging in, or filling in forms.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Performance Cookies</h3>
              <p className="text-muted-foreground">
                These cookies allow us to count visits and traffic sources so we can measure and 
                improve the performance of our site. They help us to know which pages are the most 
                and least popular and see how visitors move around the site.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Functional Cookies</h3>
              <p className="text-muted-foreground">
                These cookies enable the website to provide enhanced functionality and 
                personalization. They may be set by us or by third-party providers whose services 
                we have added to our pages.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Targeting Cookies</h3>
              <p className="text-muted-foreground">
                These cookies may be set through our site by our advertising partners. They may be 
                used by those companies to build a profile of your interests and show you relevant 
                advertisements on other sites.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Managing Cookies</h2>
          <p className="text-muted-foreground">
            You can control and/or delete cookies as you wish. You can delete all cookies that are 
            already on your computer and you can set most browsers to prevent them from being placed. 
            If you do this, however, you may have to manually adjust some preferences every time you 
            visit a site and some services and functionalities may not work.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Third-Party Cookies</h2>
          <p className="text-muted-foreground">
            In some special cases, we also use cookies provided by trusted third parties. The following 
            section details which third party cookies you might encounter through this site:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Google Analytics: To understand how you use our website</li>
            <li>Social Media: To enable you to share our content with your friends and networks</li>
            <li>Payment Processors: To securely process your payments</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Updates to This Policy</h2>
          <p className="text-muted-foreground">
            We may update this Cookie Policy from time to time to reflect changes in our practices 
            or for other operational, legal, or regulatory reasons. Please visit this Cookie Policy 
            regularly to stay informed about our use of cookies and related technologies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Contact Us</h2>
          <p className="text-muted-foreground">
            If you have any questions about our use of cookies or other technologies, please contact us at:
          </p>
          <p className="text-muted-foreground">
            Email: <a href="mailto:shkshreyaskumar@gmail.com" className="text-primary hover:underline">shkshreyaskumar@gmail.com</a>
          </p>
        </section>
      </div>
    </PageLayout>
  );
} 