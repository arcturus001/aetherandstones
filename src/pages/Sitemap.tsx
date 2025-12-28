import { useEffect } from 'react';
import { generateSitemap } from '../utils/sitemap';

const Sitemap = () => {
  useEffect(() => {
    const sitemap = generateSitemap();
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    window.location.href = url;
  }, []);

  return null;
};

export default Sitemap;

