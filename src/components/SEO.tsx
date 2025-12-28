import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  noindex?: boolean;
  structuredData?: object;
}

const baseUrl = 'https://www.aetherandstones.com';
const defaultTitle = "Aether & Stones — We don't sell luxury. We sell energy.";
const defaultDescription = "Hand-finished stone bracelets crafted to amplify how you feel. Each piece is designed to channel the energy you need most.";
const defaultImage = `${baseUrl}/hero.jpeg`;

export const SEO = ({ 
  title, 
  description, 
  image = defaultImage,
  type = 'website',
  noindex = false,
  structuredData
}: SEOProps) => {
  const location = useLocation();
  const url = `${baseUrl}${location.pathname}`;
  
  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;

  useEffect(() => {
    // Update document title
    document.title = finalTitle;
    
    // Helper to update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Primary meta tags
    updateMetaTag('title', finalTitle);
    updateMetaTag('description', finalDescription);
    updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // Open Graph tags
    updateMetaTag('og:title', finalTitle, true);
    updateMetaTag('og:description', finalDescription, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'Aether & Stones', true);
    
    // Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:title', finalTitle, true);
    updateMetaTag('twitter:description', finalDescription, true);
    updateMetaTag('twitter:image', image, true);
    updateMetaTag('twitter:url', url, true);
  }, [finalTitle, finalDescription, image, type, url, noindex]);

  // Add structured data if provided
  useEffect(() => {
    if (!structuredData) return;

    // Remove existing dynamic structured data
    const existingScript = document.querySelector('script[data-seo-structured-data]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-structured-data', 'true');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[data-seo-structured-data]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [structuredData]);

  return null;
};

