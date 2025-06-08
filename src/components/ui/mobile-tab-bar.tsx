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

export function MobileTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const handleOpenPricing = () => {
    window.dispatchEvent(new CustomEvent('open-pricing'));
  };

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
              <DropdownMenuItem onClick={handleOpenPricing}>
                View Plans
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => navigate('/about')}>
              About
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/help')}>
              Help Center
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/contact')}>
              Contact
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}