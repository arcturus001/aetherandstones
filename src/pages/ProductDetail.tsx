import type { CSSProperties } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Heading,
  Text,
  Button,
  Badge,
  Divider,
} from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { products } from "../data/products";
import { getBadgeColor } from "../utils/badgeColors";

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

const propertyGroupStyles: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 16,
};

const sectionStyles: CSSProperties = {
  marginTop: 48,
  padding: "0 16px 48px",
};

const infoCardWrapperStyles: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
  marginTop: 32,
};

const infoCardStyles: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 16,
  padding: 20,
};

const bulletStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  marginTop: 16,
};

const ProductDetail = () => {
  const params = useParams<{ productId: string }>();
  const product = params?.productId
    ? products.find((item) => item.id === params.productId)
    : undefined;

  return (
    <div style={{ backgroundColor: "#050505", color: "white", minHeight: "100vh" }}>
      <Header />

      {!product ? (
        <main style={{ padding: "80px 16px", textAlign: "center" }}>
          <Heading level={2}>Product not found</Heading>
          <Text styles={style({ marginTop: "[16px]", color: "neutral-subdued" })}>
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
              }}
            >
              <Heading level={1} styles={style({
                fontSize: "[40px]",
                marginBottom: "[8px]",
              })}>
                {product.name}
              </Heading>
              <div className={style({
                display: "inline-flex",
                borderRadius: "pill",
                paddingY: "[2px]",
                paddingX: "[12px]",
                marginBottom: "[12px]",
                backgroundColor: "black",
                border: "1px solid",
              })} style={{
                borderColor: product.inStock ? "rgba(44, 212, 129, 0.85)" : "rgba(223, 74, 74, 0.85)",
                paddingLeft: 0,
              }}>
                <Badge
                  variant={product.inStock ? "positive" : "negative"}
                >
                  {product.inStock ? "In stock" : "Sold out"}
                </Badge>
              </div>
              <div style={propertyGroupStyles}>
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
                marginTop: 32,
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                alignItems: "center",
              }}>
                <Text styles={style({
                  font: "title-lg",
                  fontWeight: "bold",
                })}>
                  ${product.price}
                </Text>
                {product.originalPrice && product.originalPrice > product.price && (
                  <Text styles={style({
                    fontSize: "[18px]",
                    textDecoration: "line-through",
                    color: "neutral-subdued",
                  })}>
                    ${product.originalPrice}
                  </Text>
                )}
                <Link to="/" style={{ textDecoration: "none" }}>
                  <Button variant="secondary" isDisabled={!product.inStock}>
                    {product.inStock ? "Shop now" : "Notify me"}
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section style={sectionStyles}>
            <Heading level={2}>About the stone</Heading>
            <Text styles={style({
              marginTop: "[12px]",
              color: "neutral-subdued",
              maxWidth: "[640px]",
              lineHeight: "[1.6]",
            })}>
              {product.description}
            </Text>

            <div style={infoCardWrapperStyles}>
              <div style={infoCardStyles}>
                <Text styles={style({ fontWeight: "bold", marginBottom: "[8px]" })}>
                  Energy focus
                </Text>
                <Text styles={style({ color: "neutral-subdued" })}>
                  {product.properties.join(" • ")}
                </Text>
              </div>
              <div style={infoCardStyles}>
                <Text styles={style({ fontWeight: "bold", marginBottom: "[8px]" })}>
                  Crafted for
                </Text>
                <Text styles={style({ color: "neutral-subdued" })}>
                  Statement layering, mindful rituals, or anchoring everyday energy.
                </Text>
              </div>
            </div>
          </section>

          <section style={sectionStyles}>
            <Heading level={2}>Why we made it</Heading>
            <Divider size="L" />
            <div style={bulletStyles}>
              <Text>
                Radiant, ethically sourced stones are wrapped with clean shareable energy.
              </Text>
              <Text>
                Each bracelet is inspected twice to ensure tension and finish feel luxuriously smooth.
              </Text>
              <Text>
                Packaged in a keepsake pouch ready for gifting or reconnecting with your daily rituals.
              </Text>
            </div>
          </section>
        </main>
      )}

      <Footer />
    </div>
  );
};

export default ProductDetail;

