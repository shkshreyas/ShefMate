import { useState, useEffect } from 'react';
import { HeroDemo1 } from './components/demos/HeroGalleryDemo';
import { ShuffleHero } from './components/ui/shuffle-grid';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PricingPage } from './components/pricing/PricingPage';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { MobileTabBar } from './components/ui/mobile-tab-bar';
import { Header } from './components/ui/header';
import { AIChatbot } from './components/ui/ai-chatbot';
import { SEOHead, SEOConfigs } from './components/ui/seo-head';
import { PerformanceOptimizer } from './components/ui/performance-optimizer';
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
import SocialPage from './pages/SocialPage';
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
      {/* Performance Optimizer */}
      <PerformanceOptimizer />
      
      {/* SEO Head */}
      <SEOHead {...SEOConfigs.home} />
      
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
      
      {/* AI Chatbot */}
      <AIChatbot />
      
      {/* Mobile Tab Bar - Only visible on mobile */}
      <MobileTabBar />
      
      {/* Add padding at the bottom for mobile to account for the tab bar */}
      <div className="h-16 md:h-0"></div>
    </div>
  );
}

function PageWithHeader({ children, seoConfig }: { children: React.ReactNode; seoConfig?: any }) {
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const location = useLocation();
  
  // Show chatbot on pages where customer support would be useful
  const showChatbot = [
    '/chefs',
    '/chefs/',
    '/orders',
    '/social',
    '/about',
    '/services',
    '/contact',
    '/help'
  ].some(path => location.pathname.startsWith(path));

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
      {/* Performance Optimizer */}
      <PerformanceOptimizer />
      
      {/* SEO Head */}
      <SEOHead {...seoConfig} />
      
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
      
      {/* AI Chatbot - Show on relevant pages */}
      {showChatbot && <AIChatbot />}
      
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
        <Route path="/chefs" element={<PageWithHeader seoConfig={SEOConfigs.chefs}><ChefListingPage /></PageWithHeader>} />
        <Route path="/chefs/:id" element={<PageWithHeader><ChefDetailPage /></PageWithHeader>} />
        <Route path="/chef-dashboard" element={<PageWithHeader><ChefDashboardPage /></PageWithHeader>} />
        <Route path="/dashboard/chef" element={<PageWithHeader><ChefDashboardPage /></PageWithHeader>} />
        <Route path="/become-chef" element={<PageWithHeader seoConfig={SEOConfigs.becomeChef}><BecomeChefPage /></PageWithHeader>} />
        <Route path="/orders" element={<PageWithHeader><CustomerOrdersPage /></PageWithHeader>} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/social" element={<PageWithHeader seoConfig={SEOConfigs.learn}><SocialPage /></PageWithHeader>} />
        <Route path="/social/learn" element={<PageWithHeader seoConfig={SEOConfigs.learn}><LearnPage /></PageWithHeader>} />
        <Route path="/privacy-policy" element={<PageWithHeader><PrivacyPolicyPage /></PageWithHeader>} />
        <Route path="/terms-of-service" element={<PageWithHeader><TermsOfServicePage /></PageWithHeader>} />
        <Route path="/help" element={<PageWithHeader seoConfig={SEOConfigs.help}><HelpCenterPage /></PageWithHeader>} />
        <Route path="/contact" element={<PageWithHeader seoConfig={SEOConfigs.contact}><ContactPage /></PageWithHeader>} />
        <Route path="/about" element={<PageWithHeader seoConfig={SEOConfigs.about}><AboutPage /></PageWithHeader>} />
        <Route path="/services" element={<PageWithHeader seoConfig={SEOConfigs.services}><ServicesPage /></PageWithHeader>} />
        <Route path="/cookie-policy" element={<PageWithHeader><CookiePolicyPage /></PageWithHeader>} />
        {/* Redirect any unknown routes to the home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;