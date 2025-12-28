interface ProductStructuredDataProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    inStock: boolean;
    stone?: string;
    properties?: string[];
  };
}

export const ProductStructuredData = ({ product }: ProductStructuredDataProps) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image,
    "brand": {
      "@type": "Brand",
      "name": "Aether & Stones"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://www.aetherandstones.com/product/${product.id}`,
      "priceCurrency": "USD",
      "price": product.price.toString(),
      "availability": product.inStock 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Store",
        "name": "Aether & Stones"
      }
    },
    ...(product.stone && {
      "category": product.stone,
      "material": product.stone
    }),
    ...(product.properties && product.properties.length > 0 && {
      "keywords": product.properties.join(", ")
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

