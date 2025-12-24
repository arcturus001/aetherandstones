import { useEffect, useState, type CSSProperties } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heading, Text, Button, Badge, Divider } from "../components/ui";
import { style } from "../utils/styles";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ShippingToast } from "../components/ShippingToast";
import { getProductById } from "../utils/products";
import { getBadgeColor } from "../utils/badgeColors";
import { addToCart } from "../utils/cart";

const heroStyles: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  alignItems: "center",
  gap: 40,
  maxWidth: 1200,
  margin: "0 auto",
  padding: "64px 16px 0",
};

const imageWrapperStyles: CSSProperties = {
  width: "100%",
  borderRadius: 24,
  overflow: "hidden",
  boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
};

const sectionStyles: CSSProperties = {
  marginTop: 48,
  padding: "0 16px 48px",
};

const bulletStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  marginTop: 16,
};

const whyTextStyles = style({
  lineHeight: "[1.9]",
});

/**
 * Product Preview Page - Shows exactly how the product will appear on the website
 * This is used by the admin panel to preview products before they go live
 */
const ProductPreview = () => {
  const params = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const product = params?.productId ? getProductById(params.productId) : undefined;
  const [cartCount, setCartCount] = useState(() => Number(localStorage.getItem("cart-count") ?? "0"));
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setCartCount(detail);
    };
    window.addEventListener("cart-update", handler);
    return () => window.removeEventListener("cart-update", handler);
  }, []);

  const handleAddToCart = () => {
    if (!product?.inStock) return;
    addToCart(product.id, 1);
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 3000);
  };

  const handleBuyNow = () => {
    if (!product?.inStock) return;
    addToCart(product.id, 1);
    navigate("/checkout");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [product?.id]);

  if (!product) {
    return (
      <div style={{ backgroundColor: "#050505", color: "white", minHeight: "100vh" }}>
        <Header />
        <main style={{ padding: "80px 16px", textAlign: "center" }}>
          <Heading level={2}>Product not found</Heading>
          <Text styles={style({ marginTop: "[16px]", color: "[rgba(255, 255, 255, 0.6)]" })}>
            We couldn't find that product. Return to admin panel.
          </Text>
          <div style={{ marginTop: 24 }}>
            <Link to="/admin" style={{ textDecoration: "none" }}>
              <Button variant="primary">Back to Admin</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#050505", color: "white", minHeight: "100vh" }}>
      {/* Preview Banner */}
      <div
        style={{
          backgroundColor: "#CB6D47",
          color: "#050505",
          padding: "12px 24px",
          textAlign: "center",
          fontWeight: "600",
          position: "sticky",
          top: 0,
          zIndex: 10000,
        }}
      >
        👁️ PREVIEW MODE - This is how the product will appear on the website
        <Link
          to="/admin"
          style={{
            marginLeft: 16,
            color: "#050505",
            textDecoration: "underline",
            fontWeight: "bold",
          }}
        >
          Return to Admin
        </Link>
      </div>

      <Header />
      <main>
        <section style={heroStyles}>
          <div style={imageWrapperStyles}>
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              flex: 1,
              minHeight: "fit-content",
              marginTop: 40,
            }}
          >
            <Heading level={2} styles={style({ marginBottom: "[8px]" })}>
              {product.name}
            </Heading>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 24,
                marginBottom: 8,
                width: "100%",
                maxWidth: "640px",
              }}
            >
              <div>
                <Heading
                  level={2}
                  styles={style({
                    font: "title-lg",
                    fontWeight: "bold",
                    color: "white",
                    margin: 0,
                  })}
                  UNSAFE_className="price-heading-40"
                >
                  ${product.price}
                </Heading>
                {product.originalPrice && product.originalPrice > product.price && (
                  <Text
                    styles={style({
                      fontSize: "[18px]",
                      textDecoration: "line-through",
                      color: "neutral-subdued",
                    })}
                  >
                    ${product.originalPrice}
                  </Text>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                {product.properties.map((property) => {
                  const color = getBadgeColor(property);
                  return (
                    <div key={property} style={{ "--badge-color": color } as React.CSSProperties}>
                      <Badge variant="accent" UNSAFE_className="property-badge">
                        {property}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
            <div
              style={{
                marginTop: 0,
                width: "100%",
                maxWidth: "640px",
              }}
            >
              <ShippingToast threshold={300} />
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Button
                  variant="primary"
                  isDisabled={!product.inStock}
                  UNSAFE_className="buy-now-button full-bleed-button"
                  onPress={handleBuyNow}
                  styles={style({ flex: "1 1 auto", width: "100%" })}
                >
                  {product.inStock ? "Buy now" : "Notify me"}
                </Button>
                <Button
                  variant="secondary"
                  isDisabled={!product.inStock}
                  UNSAFE_className="black-border-button"
                  onPress={handleAddToCart}
                >
                  Add to cart
                </Button>
                {cartCount > 0 && <span className="cart-count-badge">+{cartCount}</span>}
              </div>
            </div>
            <Text
              styles={style({
                marginBottom: "[8px]",
                maxWidth: "[640px]",
                color: "white",
                fontSize: "[20px]",
                lineHeight: "[1.9]",
              })}
            >
              {product.description}
            </Text>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                marginTop: 12,
              }}
            >
              <Text styles={style({ color: "var(--primarycolor)" })}>• Certified natural stones</Text>
              <Text styles={style({ color: "var(--primarycolor)" })}>• Hand-finished with care</Text>
              <Text styles={style({ color: "var(--primarycolor)" })}>• 30-day returns</Text>
              <Text styles={style({ color: "var(--primarycolor)" })}>
                Energy benefits are cultural beliefs, not medical claims
              </Text>
            </div>
            <Divider size="M" UNSAFE_className="semi-transparent-divider" />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                maxWidth: "640px",
              }}
            >
              <Text styles={style({ fontWeight: "bold", fontSize: "[16px]" })}>Bead Size</Text>
              <Text styles={style({ fontSize: "[16px]" })}>10mm</Text>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                maxWidth: "640px",
                marginTop: 8,
              }}
            >
              <Text styles={style({ fontWeight: "bold", fontSize: "[16px]" })}>Material</Text>
              <Text styles={style({ fontSize: "[16px]" })}>Natural Stone, 24k Gold Accents</Text>
            </div>
            <Divider size="M" UNSAFE_className="semi-transparent-divider" />
          </div>
        </section>

        <section style={sectionStyles}>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 650,
                textAlign: "center",
              }}
            >
              <Text
                styles={style({
                  marginTop: "[12px]",
                  color: "neutral-subdued",
                  lineHeight: "[1.6]",
                })}
              >
                {product.description}
              </Text>
            </div>
          </div>
        </section>

        {product.whyWeMadeIt && (
          <section style={sectionStyles}>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: 650,
                }}
              >
                <Heading level={2} UNSAFE_className="text-center-block">
                  Why we made it
                </Heading>
                <Divider size="L" UNSAFE_className="semi-transparent-divider" />
                <div style={bulletStyles}>
                  {product.whyWeMadeIt.split("\n").map((paragraph, index) => (
                    <Text key={index} styles={whyTextStyles}>
                      {paragraph}
                    </Text>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {showToast && (
        <div className="cart-toast">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px" }}>
            <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <Text styles={style({ color: "white", fontWeight: "500" })}>Added to cart!</Text>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProductPreview;

