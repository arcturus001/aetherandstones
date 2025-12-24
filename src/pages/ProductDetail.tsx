import { useEffect, useState, type CSSProperties } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heading, Text, Button, Badge, Divider } from "../components/ui";
import { style } from "../utils/styles";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ShippingToast } from "../components/ShippingToast";
import { getProductById, getProducts } from "../utils/products";
import { getBadgeColor } from "../utils/badgeColors";
import { addToCart } from "../utils/cart";
import { hoverGreenImage, obsidianImage, brownImage, purpleImage } from "../assets";

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
  aspectRatio: "3 / 4",
  borderRadius: 24,
  overflow: "hidden",
  boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
  marginTop: -88,
  position: "relative",
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

const ProductDetail = () => {
  const params = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const product = params?.productId ? getProductById(params.productId) : undefined;
  const [cartCount, setCartCount] = useState(() => Number(localStorage.getItem("cart-count") ?? "0"));
  const [showToast, setShowToast] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get hover images for gallery
  const getHoverImages = () => {
    if (!product) return [];
    const products = getProducts();
    const productIndex = products.findIndex(p => p.id === product.id);
    const hoverImages: (string | null)[] = [];
    
    // Map index to hover image (same logic as Index.tsx and Shop.tsx)
    if (productIndex === 0) hoverImages.push(hoverGreenImage);
    if (productIndex === 1) hoverImages.push(obsidianImage);
    if (productIndex === 2) hoverImages.push(brownImage);
    if (productIndex === 3) hoverImages.push(purpleImage);
    if (productIndex === 4) hoverImages.push(brownImage);
    
    // Always include the main product image first
    return [product.image, ...hoverImages.filter(Boolean)];
  };
  
  const galleryImages = getHoverImages();
  const currentImage = galleryImages[currentImageIndex] || product?.image;
  
  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };
  
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };
  
  // Reset to first image when product changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product?.id]);

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

  return (
    <div style={{ backgroundColor: "#050505", color: "white", minHeight: "100vh" }}>
      <Header />

      {!product ? (
        <main style={{ padding: "80px 16px", textAlign: "center" }}>
          <Heading level={2}>Product not found</Heading>
          <Text styles={style({ marginTop: "[16px]", color: "[rgba(255, 255, 255, 0.6)]" })}>
            We couldn’t find that bracelet. Try browsing our collection instead.
          </Text>
          <div style={{ marginTop: 24 }}>
            <Link to="/" style={{ textDecoration: "none" }}>
              <Button variant="primary">
                Back to collection
              </Button>
            </Link>
          </div>
        </main>
      ) : (
        <main>
          <section style={heroStyles}>
            <div style={imageWrapperStyles}>
              <img
                src={currentImage}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  transition: "opacity 0.3s ease-in-out",
                }}
              />
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={handlePreviousImage}
                    style={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(0, 0, 0, 0.6)",
                      border: "none",
                      borderRadius: "50%",
                      width: 48,
                      height: 48,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "white",
                      fontSize: 24,
                      transition: "background-color 0.2s ease",
                      zIndex: 10,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
                    }}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    onClick={handleNextImage}
                    style={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(0, 0, 0, 0.6)",
                      border: "none",
                      borderRadius: "50%",
                      width: 48,
                      height: 48,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "white",
                      fontSize: 24,
                      transition: "background-color 0.2s ease",
                      zIndex: 10,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
                    }}
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
                flex: 1,
                minHeight: "fit-content",
                marginTop: 40,
                paddingTop: 56,
              }}
            >
              <Heading level={2} styles={style({ marginTop: 0, marginBottom: "[8px]" })}>
                {product.name}
              </Heading>
              <div style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 16,
                width: "100%",
                maxWidth: "640px",
              }}>
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
              <div style={{
                marginBottom: 8,
                width: "100%",
                maxWidth: "640px",
              }}>
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
                  <Text styles={style({
                    fontSize: "[18px]",
                    textDecoration: "line-through",
                    color: "neutral-subdued",
                  })}>
                    ${product.originalPrice}
                  </Text>
                )}
              </div>
              <div style={{
                marginTop: 0,
                width: "100%",
                maxWidth: "640px",
              }}>
                <ShippingToast threshold={300} />
                <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "nowrap", alignItems: "center" }}>
                  <Button
                    variant="primary"
                    isDisabled={!product.inStock}
                    UNSAFE_className="buy-now-button"
                    onPress={handleBuyNow}
                    styles={style({ flex: "1 1 auto" })}
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
                  {cartCount > 0 && (
                    <span className="cart-count-badge">+{cartCount}</span>
                  )}
                </div>
              </div>
              <Text styles={style({
                marginBottom: "[8px]",
                maxWidth: "[640px]",
                color: "white",
                fontSize: "[20px]",
                lineHeight: "[1.9]",
              })}>
                A symbol of clarity and inner peace, the Amethyst Power Bracelet is crafted to help calm the mind and strengthen intuition. Traditionally associated with protection and balance, amethyst is believed to ease stress, support emotional healing, and encourage mindful focus. Designed for everyday wear, this bracelet blends natural beauty with purposeful energy.
              </Text>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              marginTop: 12,
            }}>
              <Text styles={style({ color: "var(--primarycolor)" })}>• Certified natural stones</Text>
              <Text styles={style({ color: "var(--primarycolor)" })}>• Hand-finished with care</Text>
              <Text styles={style({ color: "var(--primarycolor)" })}>• 30-day returns</Text>
              <Text styles={style({ color: "var(--primarycolor)" })}>Energy benefits are cultural beliefs, not medical claims</Text>
            </div>
              <Divider size="M" UNSAFE_className="semi-transparent-divider" />
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                maxWidth: "640px",
              }}>
                <Text styles={style({ fontWeight: "bold", fontSize: "[16px]" })}>Bead Size</Text>
                <Text styles={style({ fontSize: "[16px]" })}>10mm</Text>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                maxWidth: "640px",
                marginTop: 8,
              }}>
                <Text styles={style({ fontWeight: "bold", fontSize: "[16px]" })}>Material</Text>
                <Text styles={style({ fontSize: "[16px]" })}>Natural Stone, 24k Gold Accents</Text>
              </div>
              <Divider size="M" UNSAFE_className="semi-transparent-divider" />
            </div>
          </section>

          <section style={sectionStyles}>
            <div style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}>
              <div style={{
                width: "100%",
                maxWidth: 650,
                textAlign: "center",
              }}>
                <Text styles={style({
                  marginTop: "[12px]",
                  color: "neutral-subdued",
                  lineHeight: "[1.6]",
                })}>
                  {product.description}
                </Text>
              </div>
            </div>
          </section>

          <section style={sectionStyles}>
            <div style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}>
              <div style={{
                width: "100%",
                maxWidth: 650,
              }}>
                <Heading level={2} UNSAFE_className="text-center-block">
                  Why we made it
                </Heading>
                <div style={bulletStyles}>
                  {product.whyWeMadeIt ? (
                    <Text styles={whyTextStyles}>{product.whyWeMadeIt}</Text>
                  ) : (
                    <>
                      <Text styles={whyTextStyles}>
                        We made the Amethyst Power Bracelet as a reminder to slow down in a world that constantly asks us to rush.
                      </Text>
                      <Text styles={whyTextStyles}>
                        Modern life is loud — notifications, decisions, pressure, noise. Amethyst has long been associated with clarity, protection, and calm, and we were drawn to it not as a trend, but as a symbol of mental space and balance.
                      </Text>
                      <Text styles={whyTextStyles}>
                        This bracelet wasn't designed to be flashy. It was designed to be felt.
                        Something you can wear every day — during work, creation, rest, or reflection — as a quiet anchor back to yourself.
                      </Text>
                      <Text styles={whyTextStyles}>
                        We chose amethyst for its depth of color and meaning, and shaped the bracelet with simplicity in mind, so it could live with you, not just sit in a box.
                      </Text>
                      <Text styles={whyTextStyles}>
                        This piece exists to support moments of pause, intention, and inner strength — the kind that doesn't need to be seen to be real.
                      </Text>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

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

export default ProductDetail;

