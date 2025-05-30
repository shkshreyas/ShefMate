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
    id: "basic",
    name: "Basic",
    description: "Perfect for casual cooking enthusiasts",
    price: 9.99,
    features: [
      "Access to 100+ recipes",
      "Basic meal planning",
      "Email support",
      "1 shef consultation per month",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Our most popular plan for food lovers",
    price: 19.99,
    popular: true,
    features: [
      "Access to 500+ recipes",
      "Advanced meal planning",
      "Priority email & chat support",
      "2 Shef consultations per month",
      "Custom weekly menu suggestions",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    description: "For serious cooks and food professionals",
    price: 49.99,
    features: [
      "Access to all recipes & premium content",
      "Comprehensive meal planning",
      "24/7 priority support",
      "4 shef consultations per month",
      "Custom weekly menu suggestions",
      "Private cooking classes",
      "Ingredient delivery service",
    ],
  },
];

export function PricingTable() {
  const { userId } = useAuth();

  const handleSubscribe = async (planId: string) => {
    if (!userId) {
      // Handle case where user is not logged in
      return;
    }
    
    // This is where you would integrate with Clerk's billing API
    // For demonstration purposes, we're just logging the plan ID
    console.log(`Subscribing to plan: ${planId}`);
    
    // In a real implementation, you would:
    // 1. Call your backend API to create a subscription
    // 2. The backend would use Clerk's API to create a subscription for the user
    // 3. Redirect the user to the checkout page or show a success message
  };

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-serif font-bold tracking-tight text-primary sm:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Choose the perfect plan that suits your culinary journey.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`flex flex-col rounded-3xl p-8 ring-1 ring-muted sm:p-10 ${
                plan.popular
                  ? "relative bg-primary/5 ring-primary shadow-md z-10 sm:-mx-4 sm:mt-0 lg:-mx-4"
                  : "bg-background ring-muted/60"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-6 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                  Most popular
                </div>
              )}
              <div className="p-2">
                <h3 
                  className={`text-2xl font-serif font-bold ${
                    plan.popular ? "text-primary" : "text-foreground"
                  }`}
                >
                  {plan.name}
                </h3>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {plan.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight">${plan.price}</span>
                  <span className="text-sm font-semibold text-muted-foreground">/month</span>
                </p>
                <Button
                  className={`mt-6 w-full ${
                    plan.popular
                      ? ""
                      : "bg-primary/80 hover:bg-primary"
                  }`}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  Subscribe
                </Button>
              </div>
              <div className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex gap-3">
                    <Check className="h-6 w-5 flex-none text-primary" />
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