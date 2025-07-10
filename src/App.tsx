import { useState, useEffect } from 'react';
import { HeroDemo1 } from './components/demos/HeroGalleryDemo';
import { ShuffleHero } from './components/ui/shuffle-grid';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PricingPage } from './components/pricing/PricingPage';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { MobileTabBar } from './components/ui/mobile-tab-bar';
import { Header } from './components/ui/header';
import './App.css';
import { BlogsTestimonials } from '@/components/blocks/blogs-testimonials';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { ContactPage } from './pages/ContactPage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { CookiePolicyPage } from '@/pages/CookiePolicyPage';
import { LearnPage } from './pages/LearnPage';
import ChefDetailPage from './pages/ChefDetailPage';
import ChefDashboardPage from './pages/ChefDashboardPage';
import BecomeChefPage from './pages/BecomeChefPage';
import CustomerOrdersPage from './pages/CustomerOrdersPage';
import ChefListingPage from './pages/ChefListingPage';
import AdminPage from './pages/AdminPage';
import { Toaster } from '@/components/ui/toaster';

function AppContent() {
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const navigate = useNavigate();

  // Listen for custom events from the Header component
  useEffect(() => {
    const handleOpenPricing = () => setIsPricingOpen(true);
    
    window.addEventListener('open-pricing', handleOpenPricing);
    
    return () => {
      window.removeEventListener('open-pricing', handleOpenPricing);
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
      
      {/* Mobile Tab Bar - Only visible on mobile */}
      <MobileTabBar />
      
      {/* Add padding at the bottom for mobile to account for the tab bar */}
      <div className="h-16 md:h-0"></div>
    </div>
  );
}

function PageWithHeader({ children }: { children: React.ReactNode }) {
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  // Listen for custom events from the Header component
  useEffect(() => {
    const handleOpenPricing = () => setIsPricingOpen(true);
    
    window.addEventListener('open-pricing', handleOpenPricing);
    
    return () => {
      window.removeEventListener('open-pricing', handleOpenPricing);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header is now a separate component */}
      <Header />
      
      {/* Add padding for the header */}
      <div className="pt-20"></div>
      
      {/* Page Content */}
      {children}
      
      {/* Pricing Dialog */}
      <Dialog open={isPricingOpen} onOpenChange={setIsPricingOpen}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <PricingPage />
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
        <Route path="/chefs" element={<PageWithHeader><ChefListingPage /></PageWithHeader>} />
        <Route path="/chefs/:id" element={<PageWithHeader><ChefDetailPage /></PageWithHeader>} />
        <Route path="/chef-dashboard" element={<PageWithHeader><ChefDashboardPage /></PageWithHeader>} />
        <Route path="/dashboard/chef" element={<PageWithHeader><ChefDashboardPage /></PageWithHeader>} />
        <Route path="/become-chef" element={<PageWithHeader><BecomeChefPage /></PageWithHeader>} />
        <Route path="/orders" element={<PageWithHeader><CustomerOrdersPage /></PageWithHeader>} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/learn" element={<PageWithHeader><LearnPage /></PageWithHeader>} />
        <Route path="/privacy-policy" element={<PageWithHeader><PrivacyPolicyPage /></PageWithHeader>} />
        <Route path="/terms-of-service" element={<PageWithHeader><TermsOfServicePage /></PageWithHeader>} />
        <Route path="/help" element={<PageWithHeader><HelpCenterPage /></PageWithHeader>} />
        <Route path="/contact" element={<PageWithHeader><ContactPage /></PageWithHeader>} />
        <Route path="/about" element={<PageWithHeader><AboutPage /></PageWithHeader>} />
        <Route path="/services" element={<PageWithHeader><ServicesPage /></PageWithHeader>} />
        <Route path="/cookie-policy" element={<PageWithHeader><CookiePolicyPage /></PageWithHeader>} />
        {/* Redirect any unknown routes to the home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;