import { useNavigate } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user } = useUser();
  const navigate = useNavigate();

  const handleOpenPricing = () => {
    window.dispatchEvent(new CustomEvent('open-pricing'));
  };

  const handleOpenChefRegistration = () => {
    window.dispatchEvent(new CustomEvent('open-chef-registration'));
  };

  const handleBookChef = () => {
    navigate('/chefs');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo - visible on all devices */}
        <h1 
          onClick={() => navigate('/')} 
          className="text-2xl sm:text-3xl font-serif font-bold text-primary cursor-pointer"
        >
          ShefMate
        </h1>
        
        {/* Mobile view - only show UserButton centered */}
        <div className="flex md:hidden justify-center items-center">
          <UserButton afterSignOutUrl="/" />
        </div>
        
        {/* Desktop view - show all buttons */}
        <div className="hidden md:flex flex-wrap justify-center items-center gap-4">
          <Button
            variant="outline"
            onClick={handleBookChef}
            className="font-medium text-base px-4"
          >
            Book a Shef
          </Button>
          <Button
            variant="outline"
            onClick={handleOpenPricing}
            className="font-medium text-base px-4"
          >
            View Plans
          </Button>
          {user && (
            <Button
              variant="outline"
              onClick={handleOpenChefRegistration}
              className="font-medium text-base px-4"
            >
              Register as Shef
            </Button>
          )}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}