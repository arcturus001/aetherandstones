import { getProducts } from './products';

const baseUrl = 'https://www.aetherandstones.com';

export const generateSitemap = (): string => {
  const products = getProducts();
  
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'weekly' },
    { url: '/shop', priority: '0.9', changefreq: 'daily' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/energy', priority: '0.8', changefreq: 'monthly' },
    { url: '/faq', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/care', priority: '0.7', changefreq: 'monthly' },
    { url: '/warranty', priority: '0.7', changefreq: 'monthly' },
    { url: '/shipping', priority: '0.7', changefreq: 'monthly' },
  ];
  
  const productPages = products.map(p => ({
    url: `/product/${p.id}`,
    priority: '0.8',
    changefreq: 'weekly'
  }));
  
  const allPages = [...staticPages, ...productPages];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  return sitemap;
};

