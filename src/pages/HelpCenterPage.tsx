import { PageLayout } from "@/components/layouts/PageLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function HelpCenterPage() {
  return (
    <PageLayout
      title="Help Center"
      description="Find answers to your questions and get support"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Search Section */}
        <div className="relative">
          <Input
            type="search"
            placeholder="Search for help..."
            className="w-full pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {/* FAQ Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="bg-black text-white border rounded-lg px-4">
              <AccordionTrigger className="text-left">How do I book a chef?</AccordionTrigger>
              <AccordionContent>
                To book a chef, simply browse our chef listings, select a chef that matches your preferences,
                and click the "Book Now" button. You'll be guided through the booking process where you can
                specify your requirements, date, and time.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-black text-white border rounded-lg px-4">
              <AccordionTrigger className="text-left">What are the payment methods accepted?</AccordionTrigger>
              <AccordionContent>
                We accept various payment methods including credit/debit cards, PayPal, and other major
                payment providers. All payments are processed securely through our platform.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-black text-white border rounded-lg px-4">
              <AccordionTrigger className="text-left">How do I become a chef on ShefMate?</AccordionTrigger>
              <AccordionContent>
                To become a chef, click on "Register as Chef" in the header. You'll need to provide your
                professional details, certifications, and complete our verification process. Once approved,
                you can start accepting bookings.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-black text-white border rounded-lg px-4">
              <AccordionTrigger className="text-left">What is the cancellation policy?</AccordionTrigger>
              <AccordionContent>
                Cancellations made 24 hours or more before the scheduled time are fully refundable.
                Cancellations within 24 hours may be subject to a partial charge. Please check our
                Terms of Service for detailed information.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-black text-white border rounded-lg px-4">
              <AccordionTrigger className="text-left">How are chefs vetted and verified?</AccordionTrigger>
              <AccordionContent>
                All our chefs undergo a thorough verification process including background checks,
                professional certification verification, and skill assessment. We maintain high
                standards to ensure quality service.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Contact Support Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Still Need Help?</h2>
          <p className="text-muted-foreground">
            Our support team is here to help you. Contact us through any of the following methods:
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 bg-black text-white border rounded-lg">
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p>
                Send us an email at{" "}
                <a
                  href="mailto:shkshreyaskumar@gmail.com"
                  className="text-primary hover:underline"
                >
                  shkshreyaskumar@gmail.com
                </a>
              </p>
            </div>
            <div className="p-4 bg-black text-white border rounded-lg">
              <h3 className="font-semibold mb-2">Response Time</h3>
              <p>
                We typically respond to all inquiries within 24 hours during business days.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
