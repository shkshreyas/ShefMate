import { PricingTable } from "./PricingTable";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PricingPage() {
  const [showClerkPricing, setShowClerkPricing] = useState(false);

  return (
    <div className="min-h-screen pt-8 sm:pt-20">
      <div className="container px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold text-primary mb-4 sm:mb-6">
            Book a Shef Today
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
            Choose a subscription plan that works for your culinary needs. From casual home cooking 
            to professional-level expertise, we have a plan for everyone.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-6 sm:mb-8">
            <Button 
              variant={!showClerkPricing ? "default" : "outline"}
              onClick={() => setShowClerkPricing(false)}
              className="w-full sm:w-auto"
            >
              Standard Plans
            </Button>
          </div>
        </div>
        
        {showClerkPricing ? <PricingTable /> : <PricingTable />}
      </div>
    </div>
  );
} 