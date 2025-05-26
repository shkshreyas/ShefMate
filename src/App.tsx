import { useState } from 'react';
import { HeroDemo1 } from './components/demos/HeroGalleryDemo';
import { ShuffleHero } from './components/ui/shuffle-grid';
import { UserButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PricingPage } from './components/pricing/PricingPage';
import './App.css';

function App() {
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const handleOpenPricing = () => {
    setIsPricingOpen(true);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-serif font-bold text-primary">ChefMate</h1>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline"
              onClick={handleOpenPricing}
              className="font-medium"
            >
              Book a Chef
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
      
      {/* Main Hero Section */}
      <ShuffleHero onBookClick={handleOpenPricing} />
      
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
    </div>
  );
}

export default App;