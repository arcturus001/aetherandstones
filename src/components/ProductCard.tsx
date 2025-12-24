import React, { CSSProperties } from "react";
import {
  CardPreview,
  Content,
  Button,
  Badge,
  Text,
} from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import { useNavigate } from "react-router-dom";
import type { Product } from "../data/products";
import { getBadgeColor } from "../utils/badgeColors";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const handleNavigate = () => {
    if (product.inStock) {
      navigate(`/product/${product.id}`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!product.inStock) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(`/product/${product.id}`);
    }
  };

  return (
    <div
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={product.inStock ? 0 : -1}
      aria-disabled={!product.inStock}
      style={{
        cursor: product.inStock ? "pointer" : "not-allowed",
        width: "100%",
        maxWidth: 320,
        backgroundColor: "#141414",
        border: "1px solid #2E2E2E",
        borderRadius: "12px",
        overflow: "hidden",
        paddingBottom: "16px",
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingTop: "16px",
      }}
    >
      <CardPreview>
        <div
          className={style({
            position: "relative",
            width: "100%",
            height: 240,
            backgroundColor: "gray-100",
            borderRadius: "[8px 8px 0 0]",
            overflow: "hidden",
          })}
        >
          <img
            src={product.image}
            alt={product.name}
            className={style({
              width: "100%",
              height: "100%",
              objectFit: "cover",
            })}
          />
          {!product.inStock && (
            <div
              className={style({
                position: "absolute",
                top: 8,
                right: 8,
              })}
            >
              <Badge variant="negative">Out of Stock</Badge>
            </div>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <div
              className={style({
                position: "absolute",
                top: 8,
                left: 8,
              })}
            >
              <Badge variant="positive">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </Badge>
            </div>
          )}
        </div>
      </CardPreview>

      <div className={style({ marginTop: 24, padding: 0 })}>
        <div className={style({ display: "flex", alignItems: "center" })}>
          <Text
            styles={style({
              font: "heading-sm",
              fontWeight: "bold",
              color: "white",
              marginBottom: 8,
            })}
          >
            {product.name}
          </Text>
        </div>
      </div>

      <Content>
        <Text
          styles={style({
            color: "white",
            font: "detail-sm",
            marginBottom: 12,
          })}
        >
          {product.description}
        </Text>

        <div className={style({ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 16, marginBottom: 16 })}>
          {product.properties.slice(0, 3).map((property) => {
            const color = getBadgeColor(property);
            const styleProps = { "--badge-color": color } as CSSProperties;
            return (
              <div key={property} style={styleProps}>
                <Badge
                  variant="neutral"
                  UNSAFE_className="property-badge"
                >
                  {property}
                </Badge>
              </div>
            );
          })}
        </div>

        <div className={style({ display: "flex", alignItems: "center", justifyContent: "space-between" })}>
          <div className={style({ display: "flex", alignItems: "baseline", gap: 4 })}>
            <Text
              styles={style({
                font: "heading-sm",
                fontWeight: "bold",
                color: "white",
              })}
            >
              ${product.price}
            </Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <span
                style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.6)",
                  textDecoration: "line-through",
                }}
              >
                ${product.originalPrice}
              </span>
            )}
          </div>

          <Button
            variant="primary"
            size="S"
            isDisabled={!product.inStock}
            onPress={handleNavigate}
          >
            {product.inStock ? "View Details" : "Sold Out"}
          </Button>
        </div>
      </Content>
    </div>
  );
};
