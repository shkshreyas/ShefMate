import { useState } from "react";
import { Home, Search, CreditCard, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { MoreMenu } from "./more-menu";

export function MobileTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  const handleOpenPricing = () => {
    window.dispatchEvent(new CustomEvent('open-pricing'));
  };
  
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t md:hidden">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={() => navigate('/')} 
            className={`flex flex-col items-center justify-center w-1/4 h-full ${location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Home size={24} />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button 
            onClick={() => navigate('/chefs')} 
            className={`flex flex-col items-center justify-center w-1/4 h-full ${location.pathname === '/chefs' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Search size={24} />
            <span className="text-xs mt-1">Find Shef</span>
          </button>
          <button 
            onClick={handleOpenPricing}
            className="flex flex-col items-center justify-center w-1/4 h-full text-muted-foreground"
          >
            <CreditCard size={24} />
            <span className="text-xs mt-1">Plans</span>
          </button>
          <button 
            onClick={() => setIsMoreMenuOpen(true)}
            className="flex flex-col items-center justify-center w-1/4 h-full text-muted-foreground"
          >
            <Menu size={24} />
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </div>
      
      {/* More Menu */}
      <MoreMenu isOpen={isMoreMenuOpen} onClose={() => setIsMoreMenuOpen(false)} />
    </>
  );
}