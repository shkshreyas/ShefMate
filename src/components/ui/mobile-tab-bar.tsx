import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/clerk-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Home, ChefHat, BookOpen, MoreHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export function MobileTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const [isChef, setIsChef] = useState(false);

  const handleOpenPricing = () => {
    window.dispatchEvent(new CustomEvent('open-pricing'));
  };

  useEffect(() => {
    async function checkChef() {
      if (user) {
        const chefsRef = collection(db, "chefs");
        const q = query(chefsRef, where("userId", "==", user.id));
        
        try {
          const querySnapshot = await getDocs(q);
          setIsChef(!querySnapshot.empty);
        } catch (error) {
          console.error("Error checking chef status:", error);
          setIsChef(false);
        }
      } else {
        setIsChef(false);
      }
    }
    checkChef();
  }, [user]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden z-[9999]">
      <div className="flex justify-around items-center h-16 px-2">
        <Button
          variant="ghost"
          size="icon"
          className={`flex-1 ${location.pathname === '/' ? 'text-orange-500' : ''}`}
          onClick={() => navigate('/')}
        >
          <Home className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={`flex-1 ${location.pathname === '/chefs' ? 'text-orange-500' : ''}`}
          onClick={() => navigate('/chefs')}
        >
          <ChefHat className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={`flex-1 ${location.pathname === '/learn' ? 'text-orange-500' : ''}`}
          onClick={() => navigate('/learn')}
        >
          <BookOpen className="h-6 w-6" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="flex-1"
            >
              <MoreHorizontal className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 z-[10000]">
            {user && (
              <>
                <DropdownMenuItem onClick={() => navigate('/orders')} className="cursor-pointer">
                  My Orders
                </DropdownMenuItem>
                {isChef ? (
                  <DropdownMenuItem onClick={() => navigate('/dashboard/chef')} className="cursor-pointer">
                    Chef Dashboard
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => navigate('/become-chef')} className="cursor-pointer">
                    Become a Chef
                  </DropdownMenuItem>
                )}
              </>
            )}
            {user && (
              <DropdownMenuItem onClick={handleOpenPricing} className="cursor-pointer">
                View Plans
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => navigate('/about')} className="cursor-pointer">
              About
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/help')} className="cursor-pointer">
              Help Center
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/contact')} className="cursor-pointer">
              Contact
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}