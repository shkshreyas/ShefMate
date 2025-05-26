import { PricingTable } from "./PricingTable";
import { ClerkPricingTable } from "@/components/clerk/PricingTable";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PricingPage() {
  const [showClerkPricing, setShowClerkPricing] = useState(false);

  return (
    <div className="min-h-screen pt-20">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary mb-6">
            Book a Chef Today
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Choose a subscription plan that works for your culinary needs. From casual home cooking 
            to professional-level expertise, we have a plan for everyone.
          </p>
          
          <div className="flex justify-center space-x-4 mb-8">
            <Button 
              variant={!showClerkPricing ? "default" : "outline"}
              onClick={() => setShowClerkPricing(false)}
            >
              Standard Plans
            </Button>
            <Button 
              variant={showClerkPricing ? "default" : "outline"}
              onClick={() => setShowClerkPricing(true)}
            >
              Clerk Billing Plans
            </Button>
          </div>
        </div>
        
        {showClerkPricing ? <ClerkPricingTable /> : <PricingTable />}
      </div>
    </div>
  );
} 