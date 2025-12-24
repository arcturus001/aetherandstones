import {
  Heading,
  Text,
  Button,
} from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ProductCard } from "../components/ProductCard";
import { homeCopy } from "../data/copy";
import { products } from "../data/products";
import { heroImage } from "../assets";
import { primarycolor } from "../styles/primaryColor";

const Index = () => {
  const featuredProducts = products.filter(p => p.featured);
  const featuredHeadingStyles = style({
    fontSize: "[40px]",
    color: "white",
    marginBottom: "[16px]",
  });
  const featuredDescriptionStyles = style({
    font: "body-lg",
    color: "[rgba(143, 143, 143, 1)]",
    textAlign: "center",
    marginTop: "[22px]",
    fontWeight: "[200]",
  });
  const energyHeadingStyles = style({
    fontSize: "[40px]",
    color: "white",
    textAlign: "center",
  });
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }}>
      <Header />

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section
          style={{
            position: "relative",
            minHeight: "calc(100vh - 80px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${heroImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "black",
              opacity: 0.7,
            }}
          />
          <div style={{
            position: "relative",
            zIndex: 10,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 0,
            padding: 16,
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto",
          }}>
            <div
              style={{
                backgroundColor: "black",
                color: "white",
                borderRadius: "50px",
                display: "inline-block",
                padding: "4px 8px",
                fontSize: "12px",
                fontWeight: "500",
                outline: `1pt solid ${primarycolor}`,
                outlineOffset: "2px",
              }}
            >
              New Collection
            </div>
            <div style={{
              color: "white",
              textAlign: "center",
              margin: "20px",
              letterSpacing: "-2px",
              display: "inline-block",
              width: "auto",
              padding: "0 12px",
            }}>
                <Heading
                  level={1}
                  styles={style({
                    fontSize: "[80px]",
                  })}
                >
                We don't sell luxury — we sell energy.
              </Heading>
            </div>
            <Text
              styles={style({
                font: "body-3xl",
                fontWeight: "normal",
                color: "[rgba(153, 153, 153, 1)]",
                textAlign: "center",
                marginBottom: "[20px]",
              })}
            >
              {homeCopy.heroDescription}
            </Text>
            <div style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              paddingTop: 16,
              flexWrap: "wrap",
            }}>
              <a href="/shop" style={{ textDecoration: 'none' }}>
                <div style={{
                  backgroundColor: '#D1A95B',
                  color: 'black',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '400',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  display: 'inline-block'
                }}>
                  Shop Energy
                </div>
              </a>
              <a href="/about" style={{ textDecoration: 'none' }}>
                <div style={{
                  backgroundColor: 'black',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: '1px solid #D1A95B',
                  display: 'inline-block'
                }}>
                  Our Story
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section
          style={{
            borderTop: "0.5px solid #D1A95B",
            borderBottom: "0.5px solid #D1A95B",
            backgroundColor: "black",
            padding: "24px 0",
          }}
        >
          <div style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 16px",
          }}>
            <div style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 32,
              fontSize: "14px",
              color: "white",
              flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Text>✦</Text>
                <Text>Certified materials</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Text>◆</Text>
                <Text>Free express over $300</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Text>✧</Text>
                <Text>30-day returns</Text>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Collection */}
        <section style={{ padding: "96px 0", backgroundColor: "black" }}>
          <div style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 16px",
          }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <Heading level={2} UNSAFE_className="featured-heading" styles={featuredHeadingStyles}>
                Featured Collection
              </Heading>
              <Text styles={featuredDescriptionStyles}>
                {homeCopy.featuredDescription}
              </Text>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 24,
              maxWidth: 1024,
              margin: "0 auto",
            }}>
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 32 }}>
              <a href="/shop" style={{ textDecoration: 'none' }}>
                <Button size="L" variant="secondary" UNSAFE_className="highlight-button">
                  View Full Collection
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Energy Guide CTA */}
        <section style={{
          padding: "96px 0",
          backgroundColor: "#141414",
          borderTop: "1px solid #2E2E2E",
          borderBottom: "1px solid #2E2E2E",
        }}>
            <div style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 16px",
              textAlign: "center",
            }}>
              <Heading level={2} UNSAFE_className="energy-heading" styles={energyHeadingStyles}>
                Find Your Energy
              </Heading>
              <Text
                styles={style({
                  font: "body-lg",
                  color: "neutral-subdued",
                  textAlign: "center",
                  marginTop: 16,
                })}
              >
                {homeCopy.energyGuideDescription}
              </Text>
            <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
              <a href="/energy" style={{ textDecoration: 'none' }}>
                <Button size="L" variant="secondary" UNSAFE_className="highlight-button">
                  Explore Energy Guide
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
