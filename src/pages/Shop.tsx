import { style } from "../utils/styles";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { SEO } from "../components/SEO";
import { getProducts } from "../utils/products";
import { ProductCard } from "../components/ProductCard";
import { PageHero } from "../components/PageHero";
import { hoverGreenImage, obsidianImage, brownImage, purpleImage } from "../assets";
import { useSearchParams } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { Text, SegmentedControl } from "../components/ui";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category"); // "forHer" or "forHim"
  const [allProducts, setAllProducts] = useState(getProducts());

  // Listen for storage changes to update products when admin panel updates them
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin-products') {
        setAllProducts(getProducts());
      }
    };

    // Listen for storage events (when localStorage changes in another tab/window)
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom event when localStorage changes in same window
    const handleCustomStorageChange = () => {
      setAllProducts(getProducts());
    };
    window.addEventListener('admin-products-updated', handleCustomStorageChange);

    // Refresh products when window gains focus (in case admin panel was updated)
    const handleFocus = () => {
      setAllProducts(getProducts());
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('admin-products-updated', handleCustomStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
  
  const filteredProducts = useMemo(() => {
    if (category === "forHer") {
      return allProducts.filter(p => p.forHer === true);
    } else if (category === "forHim") {
      return allProducts.filter(p => p.forHim === true);
    }
    return allProducts;
  }, [allProducts, category]);

  const handleFilterChange = (newCategory: string | null) => {
    if (newCategory === null) {
      setSearchParams({});
    } else {
      setSearchParams({ category: newCategory });
    }
  };

  const pageTitle = category === "forHer" 
    ? "For Her — Aether & Stones" 
    : category === "forHim" 
    ? "For Him — Aether & Stones"
    : "Shop Collection — Aether & Stones";
  
  const pageDescription = category === "forHer"
    ? "Discover our collection of hand-finished stone bracelets designed for her. Each piece is carefully crafted to channel the energy you need most."
    : category === "forHim"
    ? "Explore our collection of hand-finished stone bracelets designed for him. Each piece is carefully crafted to channel the energy you need most."
    : "Browse our complete collection of hand-finished stone bracelets. Each piece is carefully crafted to channel the energy you need most.";
  
  return (
      <div style={style({
        minHeight: "[100vh]",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
      })}>
      <SEO 
        title={pageTitle}
        description={pageDescription}
      />
      <Header />

      <main style={style({
        flex: 1,
        padding: "[64px 16px 80px]",
        display: "flex",
        flexDirection: "column",
        gap: 48,
      })}>
        <PageHero
          title={category === "forHer" ? "For Her" : category === "forHim" ? "For Him" : "Collection"}
          subtitle="Hand-finished stone bracelets crafted to amplify how you feel."
        />

        {/* Segmented Control Filter */}
        <div style={style({
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: -24,
        })}>
          <SegmentedControl
            options={[
              { value: "all", label: "All Products" },
              { value: "forHer", label: "For Her" },
              { value: "forHim", label: "For Him" },
            ]}
            value={category || "all"}
            onChange={handleFilterChange}
          />
        </div>

        {/* Products Count */}
        {filteredProducts.length === 0 && (
          <div style={style({
            textAlign: "center",
            padding: "48px 16px",
          })}>
            <Text styles={style({
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "[18px]",
            })}>
              No products found in this category. Check back soon!
            </Text>
          </div>
        )}

        <section className="products-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 56,
          maxWidth: "85vw",
          margin: "0 auto",
        }}>
          {filteredProducts.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              hoverImage={
                index === 0 ? hoverGreenImage : 
                index === 1 ? obsidianImage : 
                index === 2 ? brownImage : 
                index === 3 ? purpleImage : 
                index === 4 ? brownImage : 
                null
              } 
            />
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;

