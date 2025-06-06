import { useNavigate } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import './header.css';

function InteractiveLogo() {
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const logoContainer = logoRef.current;
    if (!logoContainer) return;

    function createSparkle(x: number, y: number) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.left = x + 'px';
      sparkle.style.top = y + 'px';
      
      const tx = (Math.random() - 0.5) * 100;
      const ty = (Math.random() - 0.5) * 100;
      sparkle.style.setProperty('--tx', tx + 'px');
      sparkle.style.setProperty('--ty', ty + 'px');
      
      document.body.appendChild(sparkle);
      
      sparkle.style.animation = 'sparkleMove 1.5s ease-out forwards';
      
      setTimeout(() => {
        if (sparkle.parentNode) {
          sparkle.parentNode.removeChild(sparkle);
        }
      }, 1500);
    }

    const handleClick = () => {
      const rect = logoContainer.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          const offsetX = (Math.random() - 0.5) * 150;
          const offsetY = (Math.random() - 0.5) * 150;
          createSparkle(centerX + offsetX, centerY + offsetY);
        }, i * 100);
      }
      
      logoContainer.style.transform = 'scale(0.95)';
      setTimeout(() => {
        logoContainer.style.transform = 'scale(1.05)';
        setTimeout(() => {
          logoContainer.style.transform = 'scale(1)';
        }, 150);
      }, 100);
    };

    const handleMouseEnter = () => {
      const sparkleInterval = setInterval(() => {
        if (logoContainer.matches(':hover')) {
          const rect = logoContainer.getBoundingClientRect();
          const x = rect.left + Math.random() * rect.width;
          const y = rect.top + Math.random() * rect.height;
          createSparkle(x, y);
        } else {
          clearInterval(sparkleInterval);
        }
      }, 800);
    };

    logoContainer.addEventListener('click', handleClick);
    logoContainer.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      logoContainer.removeEventListener('click', handleClick);
      logoContainer.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  return (
    <div ref={logoRef} className="logo-container cursor-pointer transition-transform duration-300 hover:scale-105">
      <div className="cooking-steam">
        <div className="steam-line"></div>
        <div className="steam-line"></div>
        <div className="steam-line"></div>
      </div>
      
      <div className="chef-hat">
        <div className="chef-hat-lines"></div>
        <div className="heart"></div>
      </div>
      
      <div className="logo-text">
        <span className="shef">Shef</span><span className="mate">Mate</span>
      </div>
      
      <div className="tagline">Your Culinary Companion</div>
    </div>
  );
}

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
        <div className="flex items-center">
          <InteractiveLogo />
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>About</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 w-[200px]">
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          href="/about"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">About Us</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Learn more about our mission and values
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          href="/services"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Services</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Explore our range of culinary services
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Support</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 w-[200px]">
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          href="/help"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Help Center</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Get help and find answers to your questions
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a
                          href="/contact"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Contact Us</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Get in touch with our team
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

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
        
        {/* Mobile view - only show UserButton centered */}
        <div className="flex md:hidden justify-center items-center">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}