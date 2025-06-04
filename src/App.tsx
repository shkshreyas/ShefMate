import { useState, useEffect } from 'react';
import { HeroDemo1 } from './components/demos/HeroGalleryDemo';
import { ShuffleHero } from './components/ui/shuffle-grid';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PricingPage } from './components/pricing/PricingPage';
import { ChefListingPage } from './components/chef/ChefListingPage';
import { ChefRegistrationForm } from './components/chef/ChefRegistrationForm';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { MobileTabBar } from './components/ui/mobile-tab-bar';
import { Header } from './components/ui/header';
import './App.css';
import { BlogsTestimonials } from '@/components/blocks/blogs-testimonials';

function AppContent() {
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isChefRegistrationOpen, setIsChefRegistrationOpen] = useState(false);
  const navigate = useNavigate();

  // Listen for custom events from the Header component
  useEffect(() => {
    const handleOpenPricing = () => setIsPricingOpen(true);
    const handleOpenChefRegistration = () => setIsChefRegistrationOpen(true);
    const handleCloseChefRegistration = () => setIsChefRegistrationOpen(false);
    
    window.addEventListener('open-pricing', handleOpenPricing);
    window.addEventListener('open-chef-registration', handleOpenChefRegistration);
    window.addEventListener('close-chef-registration', handleCloseChefRegistration);
    
    return () => {
      window.removeEventListener('open-pricing', handleOpenPricing);
      window.removeEventListener('open-chef-registration', handleOpenChefRegistration);
      window.removeEventListener('close-chef-registration', handleCloseChefRegistration);
    };
  }, []);

  const handleBookChef = () => {
    navigate('/chefs');
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header is now a separate component */}
      <Header />
      
      {/* Add padding for the header */}
      <div className="pt-20"></div>
      
      {/* Main Hero Section */}
      <ShuffleHero onBookClick={handleBookChef} />
      
      {/* Blogs and Testimonials Section */}
      <BlogsTestimonials />
      
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
      
      {/* Mobile Tab Bar - Only visible on mobile */}
      <MobileTabBar />
      
      {/* Add padding at the bottom for mobile to account for the tab bar */}
      <div className="h-16 md:h-0"></div>
    </div>
  );
}

function ChefListingWithHeader() {
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isChefRegistrationOpen, setIsChefRegistrationOpen] = useState(false);

  // Listen for custom events from the Header component
  useEffect(() => {
    const handleOpenPricing = () => setIsPricingOpen(true);
    const handleOpenChefRegistration = () => setIsChefRegistrationOpen(true);
    const handleCloseChefRegistration = () => setIsChefRegistrationOpen(false);
    
    window.addEventListener('open-pricing', handleOpenPricing);
    window.addEventListener('open-chef-registration', handleOpenChefRegistration);
    window.addEventListener('close-chef-registration', handleCloseChefRegistration);
    
    return () => {
      window.removeEventListener('open-pricing', handleOpenPricing);
      window.removeEventListener('open-chef-registration', handleOpenChefRegistration);
      window.removeEventListener('close-chef-registration', handleCloseChefRegistration);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header is now a separate component */}
      <Header />
      
      {/* Add padding for the header */}
      <div className="pt-20"></div>
      
      {/* Chef Listing Page */}
      <ChefListingPage />
      
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
      
      {/* Mobile Tab Bar - Only visible on mobile */}
      <MobileTabBar />
      
      {/* Add padding at the bottom for mobile to account for the tab bar */}
      <div className="h-16 md:h-0"></div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/chefs" element={<ChefListingWithHeader />} />
      </Routes>
    </Router>
  );
}

export default App;