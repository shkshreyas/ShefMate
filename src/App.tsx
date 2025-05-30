import { useState } from 'react';
import { HeroDemo1 } from './components/demos/HeroGalleryDemo';
import { ShuffleHero } from './components/ui/shuffle-grid';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PricingPage } from './components/pricing/PricingPage';
import { ChefListingPage } from './components/chef/ChefListingPage';
import { ChefRegistrationForm } from './components/chef/ChefRegistrationForm';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

function AppContent() {
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isChefRegistrationOpen, setIsChefRegistrationOpen] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  const handleOpenPricing = () => {
    setIsPricingOpen(true);
  };

  const handleOpenChefRegistration = () => {
    setIsChefRegistrationOpen(true);
  };

  const handleBookChef = () => {
    navigate('/chefs');
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-serif font-bold text-primary">ChefMate</h1>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline"
              onClick={handleBookChef}
              className="font-medium"
            >
              Book a Chef
            </Button>
            <Button 
              variant="outline"
              onClick={handleOpenPricing}
              className="font-medium"
            >
              View Plans
            </Button>
            {user && (
              <Button 
                variant="outline"
                onClick={handleOpenChefRegistration}
                className="font-medium"
              >
                Register as Chef
              </Button>
            )}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
      
      {/* Main Hero Section */}
      <ShuffleHero onBookClick={handleBookChef} />
      
      {/* Secondary Scrolling Hero Section with Footer */}
      <section className="relative">
        <HeroDemo1 />
      </section>

      {/* Pricing Dialog */}
      <Dialog open={isPricingOpen} onOpenChange={setIsPricingOpen}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <PricingPage />
        </DialogContent>
      </Dialog>

      {/* Chef Registration Dialog */}
      <Dialog open={isChefRegistrationOpen} onOpenChange={setIsChefRegistrationOpen}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <ChefRegistrationForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/chefs" element={<ChefListingPage />} />
      </Routes>
    </Router>
  );
}

export default App;