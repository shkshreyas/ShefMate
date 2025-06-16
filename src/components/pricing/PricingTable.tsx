import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  popular?: boolean;
}

const plans: PricingPlan[] = [
  {
    id: "free",
    name: "Free Trial",
    description: "Experience our service with a free trial",
    price: 0,
    popular: true,
    features: [
      "Access to all chefs",
      "Book any chef of your choice",
      "Flexible scheduling",
      "Direct communication with chefs",
      "Secure payment system",
    ],
  },
];

export function PricingTable() {
  const { userId } = useAuth();

  const handleSubscribe = async (planId: string) => {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSfqfKq1QZPHX-icaNLKGQl2PS2JVSrdgAhMV-aLZF-mMSUVgQ/viewform', '_blank');
  };

  return (
    <div className="py-12 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif font-bold tracking-tight text-primary">
            Start Your Culinary Journey
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-8 text-muted-foreground">
            Try our service for free and experience the joy of home-cooked meals.
          </p>
        </div>
        
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-1">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`flex flex-col rounded-3xl p-6 sm:p-8 ring-1 ring-muted ${
                plan.popular
                  ? "relative bg-primary/5 ring-primary shadow-md z-10 sm:-mx-4 sm:mt-0 lg:-mx-4"
                  : "bg-background ring-muted/60"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-4 sm:right-6 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                  Free Trial
                </div>
              )}
              <div className="p-2">
                <h3 
                  className={`text-xl sm:text-2xl font-serif font-bold ${
                    plan.popular ? "text-primary" : "text-foreground"
                  }`}
                >
                  {plan.name}
                </h3>
                <p className="mt-3 sm:mt-4 text-sm leading-6 text-muted-foreground">
                  {plan.description}
                </p>
                <p className="mt-4 sm:mt-6 flex items-baseline gap-x-1">
                  <span className="text-3xl sm:text-4xl font-bold tracking-tight">₹{plan.price}</span>
                  <span className="text-sm font-semibold text-muted-foreground">/month</span>
                </p>
                <Button
                  asChild
                  className={`mt-4 sm:mt-6 w-full ${
                    plan.popular
                      ? ""
                      : "bg-primary/80 hover:bg-primary"
                  }`}
                >
                  <a 
                    href="https://docs.google.com/forms/d/e/1FAIpQLSfqfKq1QZPHX-icaNLKGQl2PS2JVSrdgAhMV-aLZF-mMSUVgQ/viewform"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Start Free Trial
                  </a>
                </Button>
              </div>
              
              <div className="mt-6 sm:mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex gap-3">
                    <Check className="h-5 w-5 flex-none text-primary" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 