import { useNavigate } from 'react-router-dom';
import { UserButton, useUser, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import './header.css';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

function InteractiveLogo() {
  const logoRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
    <div ref={logoRef} className="logo-container cursor-pointer transition-transform duration-300 hover:scale-105" onClick={() => navigate('/') }>
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
  const { user, isLoaded } = useUser();
  const [isChef, setIsChef] = useState(false);
  const navigate = useNavigate();

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

  const handleOpenPricing = () => {
    window.dispatchEvent(new CustomEvent('open-pricing'));
  };

  const handleOpenChefRegistration = () => {
    window.dispatchEvent(new CustomEvent('open-chef-registration'));
  };

  const handleBookChef = () => {
    navigate('/chefs');
  };

  const handleLearn = () => {
    navigate('/learn');
  };
  
  const handleOrders = () => {
    navigate('/orders');
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
            onClick={handleLearn}
            className="font-medium text-base px-4"
          >
            Learn
          </Button>

          {user && (
            <Button
              variant="outline"
              onClick={handleOrders}
              className="font-medium text-base px-4"
            >
              My Orders
            </Button>
          )}

          {user && (
            isChef ? (
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard/chef')}
                className="font-medium text-base px-4"
              >
                Dashboard
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate('/become-chef')}
                className="font-medium text-base px-4"
              >
                Register as Shef
              </Button>
            )
          )}

          {isLoaded && (
            <>
              {user ? (
                <>
                  <UserButton afterSignOutUrl="/" />
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <SignInButton mode="modal">
                    <Button 
                      variant="ghost" 
                      className="font-medium text-base px-4 text-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                    >
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button 
                      className="font-medium text-base px-6 relative overflow-hidden group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <span className="relative z-10">
                        Sign Up
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </SignUpButton>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Mobile view - show UserButton when logged in, or Sign In/Up buttons when not */}
        <div className="flex md:hidden justify-center items-center">
          {isLoaded && user && (
            <Button
              variant="outline"
              onClick={handleOrders}
              className="font-medium text-sm"
              size="sm"
            >
              Orders
            </Button>
          )}
          
          {isLoaded && user && (
            isChef ? (
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard/chef')}
                className="font-medium text-sm"
                size="sm"
              >
                Dashboard
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate('/become-chef')}
                className="font-medium text-sm"
                size="sm"
              >
                Become a Chef
              </Button>
            )
          )}
          
          {isLoaded && (
            <>
              {user ? (
                <>
                  <UserButton afterSignOutUrl="/" />
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <SignInButton mode="modal">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="font-medium text-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                    >
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button 
                      size="sm"
                      className="font-medium relative overflow-hidden group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <span className="relative z-10">
                        Sign Up
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </SignUpButton>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}