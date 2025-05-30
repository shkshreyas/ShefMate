import { Button } from "@/components/ui/button";
import { useAuth } from '@clerk/clerk-react';

// This component would normally import the official Clerk PricingTable
// For demonstration purposes, we're creating a simple version that mimics the behavior

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Essential features for casual cooking enthusiasts',
    price: 9.99,
    interval: 'month',
    features: [
      'Access to 100+ recipes',
      'Basic meal planning',
      'Email support',
      '1 shef consultation per month',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Advanced features for serious home cooks',
    price: 19.99,
    interval: 'month',
    popular: true,
    features: [
      'Access to 500+ recipes',
      'Advanced meal planning',
      'Priority support',
      '2 shef consultations per month',
      'Custom weekly menu suggestions',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Complete solution for food professionals',
    price: 49.99,
    interval: 'month',
    features: [
      'Access to all recipes & premium content',
      'Comprehensive meal planning',
      '24/7 priority support',
      '4 shef consultations per month',
      'Custom weekly menu suggestions',
      'Private cooking classes',
      'Ingredient delivery service',
    ],
  },
];

export function ClerkPricingTable() {
  const { isSignedIn } = useAuth();

  const handleSubscribe = async (planId: string) => {
    // In a real implementation, this would redirect to Clerk's checkout flow
    console.log(`Subscribing to plan: ${planId}`);
    
    if (!isSignedIn) {
      // Redirect to sign in
      console.log('User needs to sign in first');
      return;
    }
    
    // Initiate Clerk checkout process
    // This would typically involve calling your backend API
    // which would then use Clerk's API to create a checkout session
  };

  return (
    <div className="py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Choose Your Chef Plan</h2>
        <p className="text-muted-foreground">Select the plan that best fits your culinary needs</p>
      </div>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-7xl mx-auto px-4">
        {PLANS.map((plan) => (
          <div 
            key={plan.id}
            className={`relative rounded-xl overflow-hidden border ${
              plan.popular 
                ? 'border-primary shadow-lg ring-1 ring-primary' 
                : 'border-border'
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                Most Popular
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </div>
              
              <Button 
                className="w-full mb-6"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleSubscribe(plan.id)}
              >
                {isSignedIn ? 'Subscribe' : 'Sign up & Subscribe'}
              </Button>
              
              <div className="space-y-2">
                <p className="text-sm font-medium mb-2">What's included:</p>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <svg className="h-5 w-5 flex-shrink-0 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 