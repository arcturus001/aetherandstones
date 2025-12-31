import { Heading, Text, Button } from "../components/ui";
import { style } from "../utils/styles";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ProductCard } from "../components/ProductCard";
import { SEO } from "../components/SEO";
import { ArrowDownBounce } from "../components/ArrowDownBounce";
import { homeCopy } from "../data/copy";
import { getProducts } from "../utils/products";
import { heroImage, heroVideoSrc, ruleImage, hoverGreenImage, obsidianImage, brownImage, purpleImage } from "../assets";
import { primarycolor } from "../styles/primaryColor";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const Index = () => {
  const products = getProducts();
  const featuredProducts = products.filter(p => p.featured);
  const scrollSectionRef = useRef<HTMLElement>(null);
  const trustBarRef = useRef<HTMLElement>(null);
  const featuredCollectionRef = useRef<HTMLElement>(null);
  const energyGuideRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const positionSections = () => {
      if (trustBarRef.current && scrollSectionRef.current && featuredCollectionRef.current && energyGuideRef.current && heroSectionRef.current) {
        // Get the actual hero section end position
        const heroSectionRect = heroSectionRef.current.getBoundingClientRect();
        const heroSectionEnd = heroSectionRect.top + heroSectionRect.height;
        // Position trust bar right after hero section ends
        trustBarRef.current.style.top = `${heroSectionEnd}px`;
        
        // Wait for trust bar to render, then position handcrafted section after it
        setTimeout(() => {
          if (trustBarRef.current && scrollSectionRef.current) {
            // Get trust bar's actual height
            const trustBarHeight = trustBarRef.current.offsetHeight;
            // Calculate trust bar bottom position relative to document
            const trustBarBottom = heroSectionEnd + trustBarHeight;
            
            // Position scroll effect section right after trust bar ends
            scrollSectionRef.current.style.top = `${trustBarBottom}px`;
            scrollSectionRef.current.style.marginTop = "0px";
          }
        }, 100);
        
        // Wait for DOM to render, then measure actual scroll section height
        setTimeout(() => {
          if (scrollSectionRef.current && featuredCollectionRef.current && energyGuideRef.current && mainRef.current) {
            // Get actual height of the handcrafted section
            // Use getBoundingClientRect for more accurate measurements including padding
            const scrollSectionRect = scrollSectionRef.current.getBoundingClientRect();
            const scrollSectionTop = scrollSectionRef.current.offsetTop;
            // Use scrollHeight to include all content, or offsetHeight + padding
            const scrollSectionHeight = Math.max(
              scrollSectionRef.current.scrollHeight,
              scrollSectionRef.current.offsetHeight,
              scrollSectionRect.height
            );
            // Position Featured Collection at the bottom of the handcrafted section
            const featuredCollectionTop = scrollSectionTop + scrollSectionHeight;
            featuredCollectionRef.current.style.top = `${featuredCollectionTop}px`;
            
            // Calculate Featured Collection height and position Energy Guide after it
            const featuredCollectionHeight = featuredCollectionRef.current.offsetHeight;
            const energyGuideTop = featuredCollectionTop + featuredCollectionHeight;
            energyGuideRef.current.style.top = `${energyGuideTop}px`;
            // Set main container height to accommodate all sections with extra padding
            const energyGuideHeight = energyGuideRef.current.offsetHeight;
            mainRef.current.style.minHeight = `${energyGuideTop + energyGuideHeight + 100}px`;
          }
          // Note: Resize animation state is handled in the top useEffect via handleScroll
        }, 300);
      }
    };

    positionSections();
    window.addEventListener("resize", positionSections);
    return () => window.removeEventListener("resize", positionSections);
  }, []);
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
      <SEO 
        title="Aether & Stones — We don't sell luxury. We sell energy."
        description="Hand-finished stone bracelets crafted to amplify how you feel. Each piece is designed to channel the energy you need most. Shop our collection of handcrafted spiritual jewelry."
        image={`https://www.aetherandstones.com${heroImage}`}
      />
      <Header />

      <main ref={mainRef} style={{ flex: 1, position: "relative", minHeight: "calc(100vh - 80px)", overflowX: "hidden", maxWidth: "100vw", boxSizing: "border-box" }}>
        {/* Hero Section */}
        <section
          ref={heroSectionRef}
          style={{
            position: "relative",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            paddingTop: "80px", // Account for fixed header height
          }}
        >
          {heroVideoSrc ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{
                position: "absolute",
                inset: 0,
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                zIndex: 0,
              }}
            >
              <source src={heroVideoSrc} type="video/mp4" />
            </video>
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                backgroundImage: `url(${heroImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "black",
              opacity: 0.7,
            }}
          />
          <div className="hero-content-container" style={{
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
              className="hero-new-collection-badge"
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
              <Heading level={1} className="hero-title" styles={style({ fontSize: "[80px]" })}>
                We don't sell luxury — we sell energy.
              </Heading>
            </div>
            <Text
              className="page-hero-subtitle shop-subtitle-color page-hero-subtitle-spacing"
              styles={style({
                fontWeight: "normal",
                color: "white",
                textAlign: "center",
                marginBottom: "[20px]",
                lineHeight: "[1.6]",
              })}
            >
              {homeCopy.heroDescription}
            </Text>
            <div className="hero-buttons-container" style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              paddingTop: 16,
              flexWrap: "wrap",
            }}>
              <a href="/shop" style={{ textDecoration: 'none' }}>
                <div style={{
                  backgroundColor: '#CB6D47',
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
                  border: '1px solid #CB6D47',
                  display: 'inline-block'
                }}>
                  Our Story
                </div>
              </a>
            </div>
            {/* For Her / For Him Cards */}
            <div className="hero-category-cards" style={{
              display: "flex",
              gap: 40,
              justifyContent: "center",
              paddingTop: 32,
              flexWrap: "nowrap",
            }}>
              <Link to="/shop?category=forHer" style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '17px 16px 41px 16px', // Top, right, bottom, left - 16px on each side
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 30, // Increased by 50% from 20px (20 * 1.5 = 30)
                  transition: 'transform 0.2s',
                  cursor: 'pointer',
                  width: 'fit-content', // Width matches image width + padding
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  <Text styles={style({
                    color: 'white',
                    fontSize: '[36px]', // Increased by 50% from 24px (24 * 1.5 = 36)
                    fontWeight: '500',
                    textAlign: 'center',
                  })}>
                    For Her
                  </Text>
                </div>
              </Link>
              <Link to="/shop?category=forHim" style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '17px 16px 41px 16px', // Top, right, bottom, left - 16px on each side
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 30, // Increased by 50% from 20px (20 * 1.5 = 30)
                  transition: 'transform 0.2s',
                  cursor: 'pointer',
                  width: 'fit-content', // Width matches image width + padding
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  <Text styles={style({
                    color: 'white',
                    fontSize: '[36px]', // Increased by 50% from 24px (24 * 1.5 = 36)
                    fontWeight: '500',
                    textAlign: 'center',
                  })}>
                    For Him
                  </Text>
                </div>
              </Link>
            </div>
          </div>
          {/* Arrow Down Bounce Animation - positioned at bottom of hero section */}
          <ArrowDownBounce />
        </section>

        {/* Trust Bar */}
        <section
          ref={trustBarRef}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            width: "100%",
            borderTop: "0.5px solid #CB6D47",
            borderBottom: "0.5px solid #CB6D47",
            backgroundColor: "black",
            padding: "12px 0",
            zIndex: 9998,
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
                <Text>Free express shipping over $500</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Text>✧</Text>
                <Text>30-day returns</Text>
              </div>
            </div>
          </div>
        </section>

        {/* Scroll Effect Section */}
        <section
          ref={scrollSectionRef}
          className="handcrafted-section in-view"
          style={{
            backgroundColor: `${primarycolor}40`,
            minHeight: "auto",
            paddingTop: "50px",
            paddingBottom: "80px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            transition: "background-color 0.6s ease-out, top 0.3s ease-out",
            position: "absolute",
            left: 0,
            right: 0,
            width: "100%",
            overflow: "visible",
            boxSizing: "border-box",
          }}
        >
          <div
            className="handcrafted-content"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 24,
              width: "85vw",
              maxWidth: "85vw",
              padding: "0 16px 24px 16px",
              position: "relative",
              minHeight: "fit-content",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                textAlign: "center",
                position: "relative",
                zIndex: 2,
              }}
            >
              <Heading
                level={2}
                styles={style({
                  fontSize: "[48px]",
                  color: "white",
                  fontWeight: "bold",
                })}
              >
                Handcrafted Excellence
              </Heading>
              <Text
                styles={style({
                  fontSize: "[20px]",
                  color: "rgba(255, 255, 255, 0.9)",
                  lineHeight: "[1.6]",
                })}
              >
                Each piece is carefully crafted to channel the energy you need most
              </Text>
            </div>
            <div
              className="handcrafted-image-container"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "80px",
                width: "500px",
                height: "500px",
                minHeight: "500px",
                overflow: "visible",
              }}
            >
              {/* Looping text behind the background */}
              <div
                className="handcrafted-looping-text"
                style={{
                  position: "fixed",
                  top: "50%",
                  left: 0,
                  width: "max-content",
                  zIndex: -3,
                  whiteSpace: "nowrap",
                  fontSize: "40px",
                  color: "rgba(190, 151, 75, 0.3)",
                  fontFamily: "var(--s2-font-family-sans, adobe-clean-spectrum-vf), adobe-clean-variable, adobe-clean, ui-sans-serif, system-ui, sans-serif",
                  fontWeight: "300",
                  letterSpacing: "2px",
                  pointerEvents: "none",
                }}
              >
                <span className="looping-text-content">
                  Where unseen energy meets ancient stone, each piece carries a whisper of harmony. Where unseen energy meets ancient stone, each piece carries a whisper of harmony. Where unseen energy meets ancient stone, each piece carries a whisper of harmony. Where unseen energy meets ancient stone, each piece carries a whisper of harmony. Where unseen energy meets ancient stone, each piece carries a whisper of harmony. Where unseen energy meets ancient stone, each piece carries a whisper of harmony.
                </span>
              </div>
              <div
                className="handcrafted-image-background"
                style={{
                  position: "absolute",
                  width: "520px",
                  height: "520px",
                  aspectRatio: "1 / 1",
                  backgroundColor: "#BE974B",
                  zIndex: -2,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
              <img
                src={ruleImage}
                alt="Handcrafted bracelet"
                className="rule-image-spin"
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                  display: "block",
                  opacity: 0.9,
                  position: "relative",
                  zIndex: -1,
                  filter: "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5)) drop-shadow(0 20px 40px rgba(0, 0, 0, 0.4)) drop-shadow(0 40px 80px rgba(0, 0, 0, 0.3))",
                }}
              />
            </div>
            <Text
              className="handcrafted-text"
              styles={style({
                fontSize: "[18px]",
                color: "rgba(255, 255, 255, 0.9)",
                lineHeight: "[1.6]",
                textAlign: "center",
                width: "100%",
                maxWidth: "600px",
                marginTop: "48px",
                marginBottom: "24px",
                position: "relative",
                zIndex: 2,
                paddingBottom: "0",
              })}
            >
              Aether & Stone was born in Armenia, where mountains, silence, and ancient stone shape both land and spirit. Inspired by this balance between the unseen and the enduring, we create minimal jewelry designed to ground, calm, and accompany everyday life. Each piece carries the quiet strength of nature — made to be worn, felt, and lived with.
            </Text>
          </div>
        </section>

        {/* Featured Collection */}
        <section 
          ref={featuredCollectionRef}
          style={{ 
            padding: "96px 0", 
            backgroundColor: "black",
            position: "absolute",
            left: 0,
            right: 0,
            width: "100%",
            transition: "top 0.3s ease-out",
          }}
        >
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
            <div className="featured-products-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 56,
              maxWidth: "85vw",
              margin: "0 auto",
            }}>
              {featuredProducts.map((product, index) => (
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
        <section 
          ref={energyGuideRef}
          style={{
            padding: "96px 0",
            backgroundColor: "#141414",
            borderTop: "1px solid #2E2E2E",
            borderBottom: "1px solid #2E2E2E",
            position: "absolute",
            left: 0,
            right: 0,
            width: "100%",
            transition: "top 0.3s ease-out",
          }}
        >
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
                  color: "white",
                  textAlign: "center",
                  marginTop: 16,
                })}
              >
                {homeCopy.energyGuideDescription}
              </Text>
            <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
              <Link to="/energy" style={{ textDecoration: 'none' }}>
                <Button size="L" variant="secondary" UNSAFE_className="highlight-button">
                  Explore Energy Guide
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
