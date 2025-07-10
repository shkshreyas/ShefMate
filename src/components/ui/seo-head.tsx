import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  structuredData?: any;
}

export function SEOHead({
  title,
  description,
  keywords,
  image = 'https://shefmate.com/og-image.jpg',
  url,
  type = 'website',
  structuredData
}: SEOHeadProps) {
  const location = useLocation();
  const currentUrl = url || `https://shefmate.com${location.pathname}`;

  useEffect(() => {
    // Update document title
    const defaultTitle = 'ShefMate - Professional Private Chefs at Home | Book Personal Chef Services';
    document.title = title ? `${title} | ShefMate` : defaultTitle;

    // Update meta description
    const defaultDescription = 'Book professional private chefs for home cooking. Enjoy restaurant-quality meals prepared in your kitchen. Specializing in Indian, Italian, Asian & International cuisine. Available 24/7 across India.';
    updateMetaTag('description', description || defaultDescription);

    // Update meta keywords
    const defaultKeywords = 'private chef, personal chef, home chef, on-demand chef, professional chef, private dining, home cooking, chef service, culinary experience, gourmet meals, Indian chef, Italian chef, Asian chef, home food delivery, luxury dining, chef booking, personal chef service, home restaurant, private chef hire, chef at home';
    updateMetaTag('keywords', keywords || defaultKeywords);

    // Update Open Graph tags
    updateMetaTag('og:title', title ? `${title} | ShefMate` : defaultTitle);
    updateMetaTag('og:description', description || defaultDescription);
    updateMetaTag('og:url', currentUrl);
    updateMetaTag('og:image', image);
    updateMetaTag('og:type', type);

    // Update Twitter tags
    updateMetaTag('twitter:title', title ? `${title} | ShefMate` : defaultTitle);
    updateMetaTag('twitter:description', description || defaultDescription);
    updateMetaTag('twitter:url', currentUrl);
    updateMetaTag('twitter:image', image);

    // Update canonical URL
    updateCanonicalUrl(currentUrl);

    // Add structured data if provided
    if (structuredData) {
      addStructuredData(structuredData);
    }

    // Add page-specific structured data based on route
    addPageSpecificStructuredData(location.pathname, title);

  }, [title, description, keywords, image, currentUrl, type, structuredData, location.pathname]);

  const updateMetaTag = (name: string, content: string) => {
    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    meta.content = content;
  };

  const updateCanonicalUrl = (url: string) => {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  };

  const addStructuredData = (data: any) => {
    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[data-seo-structured]');
    existingScripts.forEach(script => script.remove());

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-structured', 'true');
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  };

  const addPageSpecificStructuredData = (pathname: string, pageTitle?: string) => {
    let structuredData: any = {};

    if (pathname.startsWith('/chefs')) {
      if (pathname === '/chefs') {
        // Chef listing page
        structuredData = {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Professional Private Chefs",
          "description": "Browse and book professional private chefs for home cooking services",
          "url": "https://shefmate.com/chefs",
          "numberOfItems": 50,
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "item": {
                "@type": "FoodService",
                "name": "Professional Chef Services",
                "description": "Private chef services for home cooking"
              }
            }
          ]
        };
      } else if (pathname.includes('/chefs/')) {
        // Individual chef page
        const chefId = pathname.split('/').pop();
        structuredData = {
          "@context": "https://schema.org",
          "@type": "Person",
          "name": pageTitle || "Professional Chef",
          "jobTitle": "Private Chef",
          "worksFor": {
            "@type": "Organization",
            "name": "ShefMate"
          },
          "url": currentUrl,
          "image": image,
          "description": description || "Professional private chef available for home cooking services"
        };
      }
    } else if (pathname === '/about') {
      structuredData = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "About ShefMate",
        "description": "Learn about ShefMate's mission to connect customers with professional private chefs",
        "url": currentUrl
      };
    } else if (pathname === '/services') {
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Private Chef Services",
        "description": "Professional private chef services for home cooking and events",
        "provider": {
          "@type": "Organization",
          "name": "ShefMate"
        },
        "areaServed": {
          "@type": "Country",
          "name": "India"
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Chef Services",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Private Chef Service",
                "description": "Professional chef cooking in your home"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Event Catering",
                "description": "Chef services for special events and parties"
              }
            }
          ]
        }
      };
    } else if (pathname === '/contact') {
      structuredData = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Contact ShefMate",
        "description": "Get in touch with ShefMate for private chef services",
        "url": currentUrl,
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91 6202372739",
          "contactType": "customer service",
          "availableLanguage": "English"
        }
      };
    }

    if (Object.keys(structuredData).length > 0) {
      addStructuredData(structuredData);
    }
  };

  return null; // This component doesn't render anything
}

// Predefined SEO configurations for common pages
export const SEOConfigs = {
  home: {
    title: 'Professional Private Chefs at Home',
    description: 'Book professional private chefs for home cooking. Enjoy restaurant-quality meals prepared in your kitchen. Specializing in Indian, Italian, Asian & International cuisine. Available 24/7 across India.',
    keywords: 'private chef, personal chef, home chef, on-demand chef, professional chef, private dining, home cooking, chef service, culinary experience, gourmet meals, Indian chef, Italian chef, Asian chef, home food delivery, luxury dining, chef booking, personal chef service, home restaurant, private chef hire, chef at home'
  },
  chefs: {
    title: 'Browse Professional Private Chefs',
    description: 'Discover and book professional private chefs for your home. Filter by cuisine, location, and dietary preferences. Read reviews and book your perfect chef today.',
    keywords: 'private chef booking, professional chef hire, chef services, home chef, personal chef, chef near me, Indian chef, Italian chef, Asian chef, vegetarian chef, vegan chef, gluten-free chef'
  },
  becomeChef: {
    title: 'Become a Professional Chef',
    description: 'Join ShefMate as a professional chef. Start earning by providing private chef services to customers. Register today and grow your culinary business.',
    keywords: 'become a chef, chef registration, chef jobs, private chef opportunities, chef career, culinary jobs, chef application, chef signup'
  },
  learn: {
    title: 'Learn Cooking with Professional Chefs',
    description: 'Learn cooking techniques, recipes, and culinary skills with our professional chefs. Watch cooking videos and improve your culinary expertise.',
    keywords: 'cooking lessons, culinary education, cooking videos, chef tutorials, cooking tips, recipes, culinary skills, cooking classes'
  },
  about: {
    title: 'About ShefMate',
    description: 'Learn about ShefMate\'s mission to connect customers with professional private chefs. Discover our story and commitment to culinary excellence.',
    keywords: 'about ShefMate, company story, mission, vision, culinary platform, chef marketplace'
  },
  services: {
    title: 'Private Chef Services',
    description: 'Explore our comprehensive private chef services including home cooking, event catering, and specialized dietary requirements. Book your perfect chef today.',
    keywords: 'private chef services, home cooking service, event catering, dietary requirements, chef packages, culinary services'
  },
  contact: {
    title: 'Contact ShefMate',
    description: 'Get in touch with ShefMate for private chef services, support, or partnership opportunities. We\'re here to help with all your culinary needs.',
    keywords: 'contact ShefMate, customer support, chef booking help, partnership, culinary services contact'
  },
  help: {
    title: 'Help Center',
    description: 'Find answers to frequently asked questions about ShefMate services, chef booking, payments, and more. Get the help you need.',
    keywords: 'help center, FAQ, customer support, booking help, payment help, chef services help'
  }
}; 