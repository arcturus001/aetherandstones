import { style } from "../utils/styles";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { SEO } from "../components/SEO";
import { getProducts } from "../utils/products";
import { getBadgeColor } from "../utils/badgeColors";
import { BadgeTag } from "../components/BadgeTag";
import { EnergyTile } from "../components/EnergyTile";
import { PageHero } from "../components/PageHero";

const EnergyGuide = () => {
  const products = getProducts();
  
  return (
    <div
      style={style({
        minHeight: "[100vh]",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
      })}
    >
      <SEO 
        title="Energy Guide - Aether & Stones"
        description="Discover the cultural properties and traditions behind each stone. Learn about the energy benefits and metaphysical meanings of our handcrafted bracelets."
      />
      <Header />

      <main
        style={style({
          flex: 1,
          padding: "[64px 16px 80px]",
          display: "flex",
          flexDirection: "column",
          gap: 48,
        })}
      >
        <PageHero
          title="Energy Guide"
          subtitle="Discover the cultural properties and traditions behind each stone."
          disclaimer="The energy benefits described are based on cultural beliefs and metaphysical traditions. They are not medical claims and should not replace professional healthcare advice."
        />

        <section
          className="energy-guide-grid"
          style={style({
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
            gap: 32,
            width: "100%",
            maxWidth: "[1200px]",
            marginX: "auto",
          })}
        >
          {products.map((product) => {
            const badgeColor = getBadgeColor(product.properties[0]);
            return (
              <div
                key={product.id}
                style={style({
                  borderRadius: "[20px]",
                  border: "[1px solid #2E2E2E]",
                  backgroundColor: "[#1F1A11]",
                  padding: "[24px]",
                  minHeight: "[320px]",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                })}
              >
                <BadgeTag label={product.properties[0]} color={badgeColor} />
                <EnergyTile title={product.properties[0]} description={product.description} />
              </div>
            );
          })}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default EnergyGuide;

