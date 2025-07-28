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
import { FaGooglePlay, FaApple } from 'react-icons/fa';

function AppContent() {
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [showAppBanner, setShowAppBanner] = useState(true);
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

      {/* Compact Mobile App Download Banner with Close Button */}
      {showAppBanner && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-xs sm:max-w-sm md:max-w-md px-2 flex justify-center pointer-events-none">
          <div className="pointer-events-auto bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 border-2 border-white/40 animate-fade-in-up w-full relative">
            <button
              aria-label="Close"
              className="absolute top-1 right-1 text-white/80 hover:text-white text-lg font-bold rounded-full p-1 transition-colors z-10"
              onClick={() => setShowAppBanner(false)}
              style={{ lineHeight: 1 }}
            >
              ×
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-base leading-tight truncate">Get the ShefMate App</div>
              <div className="text-white/90 text-xs leading-tight truncate">Book chefs, manage orders, chat on the go!</div>
            </div>
            <a href="https://github.com/shkshreyas/ShefMate-Android/releases/download/v1.0/shefmate.apk" target="_blank" rel="noopener noreferrer" className="ml-2">
              <button className="bg-white text-orange-600 font-bold px-3 py-1 rounded-lg shadow hover:bg-orange-100 text-xs flex items-center gap-1 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Download APK
              </button>
            </a>
          </div>
        </div>
      )}

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
      
      {/* AI Chatbot - Only on home screen */}
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