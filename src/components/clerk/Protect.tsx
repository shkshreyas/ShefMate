import React from 'react';
import { useAuth } from '@clerk/clerk-react';

interface ProtectProps {
  plan?: string;
  feature?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function Protect({ plan, feature, fallback, children }: ProtectProps) {
  const { userId } = useAuth();
  
  // In a real implementation, you would use Clerk's API to check if the user has the plan/feature
  // For demonstration purposes, we're just checking if the user is authenticated
  const hasAccess = !!userId;

  if (!hasAccess) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="p-6 text-center">
        <h3 className="text-lg font-medium text-foreground mb-2">
          {plan 
            ? `This content requires the ${plan} plan` 
            : feature 
              ? `This content requires the ${feature} feature`
              : 'This content requires a subscription'}
        </h3>
        <p className="text-muted-foreground">
          Please subscribe to gain access to this content.
        </p>
      </div>
    );
  }

  return <>{children}</>;
} 