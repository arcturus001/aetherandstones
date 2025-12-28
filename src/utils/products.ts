import { products as defaultProducts, type Product } from "../data/products";

export interface ExtendedProduct extends Product {
  whyWeMadeIt?: string;
  salePercentage?: number;
  isNew?: boolean;
  enabled?: boolean;
  forHer?: boolean;
  forHim?: boolean;
}

/**
 * Get products from localStorage (admin-managed) or fallback to default products
 * Filters out disabled products for public-facing pages
 */
export const getProducts = (includeDisabled: boolean = false): ExtendedProduct[] => {
  try {
    const stored = localStorage.getItem("admin-products");
    if (stored) {
      const products = JSON.parse(stored) as ExtendedProduct[];
      // Ensure all products have forHer/forHim properties with defaults
      const normalizedProducts = products.map(p => ({
        ...p,
        forHer: p.forHer ?? false,
        forHim: p.forHim ?? false,
      }));
      if (includeDisabled) {
        return normalizedProducts;
      }
      return normalizedProducts.filter(p => p.enabled !== false);
    }
  } catch (error) {
    console.error("Failed to load products from localStorage", error);
  }
  
  // Fallback to default products
  return defaultProducts.map(p => ({ 
    ...p, 
    enabled: true, 
    isNew: false,
    forHer: p.forHer ?? false,
    forHim: p.forHim ?? false,
  }));
};

/**
 * Get a single product by ID
 */
export const getProductById = (id: string): ExtendedProduct | undefined => {
  const products = getProducts(true);
  return products.find(p => p.id === id);
};







