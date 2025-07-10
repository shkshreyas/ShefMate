import { useEffect } from 'react';

export function PerformanceOptimizer() {
  useEffect(() => {
    // Preload critical resources
    preloadCriticalResources();
    
    // Optimize images
    optimizeImages();
    
    // Implement lazy loading
    implementLazyLoading();
    
    // Add performance monitoring
    addPerformanceMonitoring();
    
    // Optimize fonts
    optimizeFonts();
  }, []);

  const preloadCriticalResources = () => {
    // Preload critical CSS and JS
    const criticalResources = [
      '/src/main.tsx',
      '/src/App.css',
      '/src/index.css'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.css') ? 'style' : 'script';
      document.head.appendChild(link);
    });
  };

  const optimizeImages = () => {
    // Add loading="lazy" to all images
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      img.setAttribute('loading', 'lazy');
      
      // Add error handling
      img.onerror = () => {
        img.src = '/placeholder-image.jpg';
      };
    });

    // Add WebP support detection
    const webpSupported = document.createElement('canvas')
      .toDataURL('image/webp')
      .indexOf('data:image/webp') === 0;

    if (webpSupported) {
      // Convert images to WebP format
      const imagesToConvert = document.querySelectorAll('img[data-webp]');
      imagesToConvert.forEach(img => {
        const webpSrc = img.getAttribute('data-webp');
        if (webpSrc) {
          img.src = webpSrc;
        }
      });
    }
  };

  const implementLazyLoading = () => {
    // Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const dataSrc = img.getAttribute('data-src');
            if (dataSrc) {
              img.src = dataSrc;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      });

      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => imageObserver.observe(img));
    }
  };

  const addPerformanceMonitoring = () => {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
        
        // Send to analytics if LCP is poor
        if (lastEntry.startTime > 2500) {
          console.warn('Poor LCP detected:', lastEntry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          console.log('FID:', entry.processingStart - entry.startTime);
          
          // Send to analytics if FID is poor
          if (entry.processingStart - entry.startTime > 100) {
            console.warn('Poor FID detected:', entry.processingStart - entry.startTime);
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += (entry as any).value;
            console.log('CLS:', clsValue);
            
            // Send to analytics if CLS is poor
            if (clsValue > 0.1) {
              console.warn('Poor CLS detected:', clsValue);
            }
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  };

  const optimizeFonts = () => {
    // Preload critical fonts
    const criticalFonts = [
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
    ];

    criticalFonts.forEach(fontUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = fontUrl;
      link.as = 'style';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Add font-display: swap
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Playfair Display';
        font-display: swap;
      }
      @font-face {
        font-family: 'Poppins';
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  };

  return null; // This component doesn't render anything
}

// Service Worker for caching and offline functionality
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

// Image optimization utility
export const optimizeImage = (src: string, width: number, quality: number = 80): string => {
  // Add image optimization parameters
  const url = new URL(src, window.location.origin);
  url.searchParams.set('w', width.toString());
  url.searchParams.set('q', quality.toString());
  url.searchParams.set('fm', 'webp');
  return url.toString();
};

// Lazy loading hook
export const useLazyLoading = () => {
  const lazyLoadImage = (img: HTMLImageElement) => {
    const dataSrc = img.getAttribute('data-src');
    if (dataSrc) {
      img.src = dataSrc;
      img.removeAttribute('data-src');
    }
  };

  return { lazyLoadImage };
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  const trackPageLoad = () => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      console.log('Page load time:', loadTime);
      
      // Send to analytics
      if (loadTime > 3000) {
        console.warn('Slow page load detected:', loadTime);
      }
    }
  };

  const trackUserInteraction = (action: string, value?: any) => {
    // Track user interactions for performance analysis
    const interaction = {
      action,
      value,
      timestamp: Date.now(),
      url: window.location.href
    };
    
    console.log('User interaction:', interaction);
    
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', action, {
        event_category: 'user_interaction',
        event_label: value,
        value: 1
      });
    }
  };

  return { trackPageLoad, trackUserInteraction };
}; 