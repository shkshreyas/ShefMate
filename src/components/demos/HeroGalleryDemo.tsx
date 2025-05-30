import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { BentoCell, BentoGrid, ContainerScroll } from "@/components/blocks/hero-gallery-scroll-animation";
import { Button } from "@/components/ui/button";
import { Protect } from "@/components/clerk/Protect";

const IMAGES = [
  "https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/3338681/pexels-photo-3338681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/2403392/pexels-photo-2403392.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/2679501/pexels-photo-2679501.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
];

export const HeroDemo1 = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showFooter, setShowFooter] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Fixed scroll sequence: stop → zoom in → zoom out → scroll down
  // 0-0.2: Stop and hold (normal size)
  // 0.2-0.4: Zoom in phase
  // 0.4-0.6: Hold zoomed in
  // 0.6-0.8: Zoom out phase
  // 0.8-1.0: Fade out and scroll down
  const scale = useTransform(
    scrollYProgress, 
    [0, 0.2, 0.4, 0.6, 0.8, 1], 
    [1, 1, 1.8, 1.8, 0.8, 0.8]
  );
  
  const opacity = useTransform(
    scrollYProgress, 
    [0, 0.01, 0.2, 0.6, 0.8, 0.9, 1], 
    [0, 1, 1, 1, 1, 0.3, 0]
  );

  // Keep images fixed during animation phases
  const position = useTransform(
    scrollYProgress,
    [0, 0.01, 0.8, 1],
    ["relative", "fixed", "fixed", "absolute"]
  );

  // Footer opacity for fade-in effect
  const footerOpacity = useTransform(
    scrollYProgress, 
    [0.85, 0.95], 
    [0, 1]
  );

  // Update showFooter state based on scroll position
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((value) => {
      setShowFooter(value > 0.85);
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <div ref={containerRef} className="relative h-[500vh]">
      <Protect plan="premium" fallback={
        <div className="h-screen flex items-center justify-center">
          <div className="text-center max-w-lg p-8 rounded-lg bg-background/80 backdrop-blur-sm">
            <h2 className="text-2xl font-serif font-bold text-primary mb-4">Premium Content</h2>
            <p className="text-muted-foreground mb-6">
              Subscribe to our Premium plan to unlock our exclusive chef gallery and content.
            </p>
            <Button>Subscribe Now</Button>
          </div>
        </div>
      }>
        <ContainerScroll className="h-[400vh]">
          <motion.div
            style={{ 
              scale, 
              opacity: opacity,
              position: position,
              top: 100,
              left: 0,
              right: 0,
              zIndex: 0
            }}
            className="h-screen w-full"
          >
            <BentoGrid className="h-screen w-full p-4">
              {IMAGES.map((imageUrl, index) => (
                <BentoCell
                  key={index}
                  className="overflow-hidden rounded-xl shadow-xl"
                >
                  <img
                    className="size-full object-cover object-center"
                    src={imageUrl}
                    alt=""
                  />
                </BentoCell>
              ))}
            </BentoGrid>
          </motion.div>
        </ContainerScroll>

        {/* Fixed Footer Section */}
        <div className="h-[100vh] relative">
          <motion.footer 
            style={{ opacity: footerOpacity }}
            className={`${showFooter ? 'fixed' : 'absolute -bottom-full'} bottom-0 left-0 right-0 w-full bg-background pt-8 sm:pt-16 pb-6 sm:pb-8 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-10 transition-all duration-500`}
          >
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                <div className="mb-6 sm:mb-0">
                  <h3 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-serif font-bold text-primary">ShefMate</h3>
                  <p className="text-sm text-muted-foreground">
                    Experience personalized culinary excellence with our on-demand chef service.
                  </p>
                </div>
                
                <div>
                  <h4 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold">Quick Links</h4>
                  <ul className="space-y-1 sm:space-y-2 footer-links">
                    <li><a href="#">Home</a></li>
                    <li><a href="#">About Us</a></li>
                    <li><a href="#">Our Chefs</a></li>
                    <li><a href="#">Services</a></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold">Support</h4>
                  <ul className="space-y-1 sm:space-y-2 footer-links">
                    <li><a href="#">Help Center</a></li>
                    <li><a href="#">Contact Us</a></li>
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">Terms of Service</a></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold">Stay Connected</h4>
                  <div className="flex space-x-4">
                    <a href="#" className="footer-social-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                    <a href="#" className="footer-social-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                    </a>
                    <a href="#" className="footer-social-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    </a>
                    <a href="#" className="footer-social-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                    </a>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">Subscribe to our newsletter</p>
                    <div className="mt-2 flex flex-col sm:flex-row">
                      <input type="email" placeholder="Your email" className="w-full sm:w-auto sm:flex-1 rounded-md sm:rounded-l-md sm:rounded-r-none border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary mb-2 sm:mb-0" />
                      <Button className="w-full sm:w-auto sm:rounded-l-none">Subscribe</Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 sm:mt-12 border-t pt-6 sm:pt-8">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <p className="text-xs sm:text-sm text-muted-foreground">&copy; 2025 ShefMate Ltd. All rights reserved.</p>
                  <div className="flex mt-4 sm:mt-0 space-x-4 sm:space-x-6 footer-links text-xs sm:text-sm">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Cookie Policy</a>
                  </div>
                </div>
              </div>
            </div>
          </motion.footer>
        </div>
      </Protect>
    </div>
  );
};