import { style } from "../utils/styles";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { SEO } from "../components/SEO";
import { getProducts } from "../utils/products";
import { ProductCard } from "../components/ProductCard";
import { PageHero } from "../components/PageHero";
import { hoverGreenImage, obsidianImage, brownImage, purpleImage } from "../assets";

const Shop = () => {
  const products = getProducts();
  
  return (
      <div style={style({
        minHeight: "[100vh]",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
      })}>
      <SEO 
        title="Shop Collection - Aether & Stones"
        description="Browse our complete collection of hand-finished stone bracelets. Each piece is carefully crafted to channel the energy you need most."
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
          title="Collection"
          subtitle="Hand-finished stone bracelets crafted to amplify how you feel."
        />

        <section className="products-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 56,
          maxWidth: "85vw",
          margin: "0 auto",
        }}>
          {products.map((product, index) => (
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

