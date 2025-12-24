import React, { useState } from "react";
import { Badge, Text } from "./ui";
import { style } from "../utils/styles";
import { useNavigate } from "react-router-dom";
import type { ExtendedProduct } from "../utils/products";
import { getBadgeColor } from "../utils/badgeColors";
import { BadgeTag } from "./BadgeTag";

interface ProductCardProps {
  product: ExtendedProduct;
  hoverImage?: string | null;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, hoverImage = null }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
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
        backgroundColor: "transparent",
        border: "none",
        borderRadius: 0,
        overflow: "hidden",
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
      }}
      className="product-card"
    >
      <div
        className="product-card-image-container"
        style={style({
          position: "relative",
          backgroundColor: "transparent",
          borderRadius: 0,
          overflow: "hidden",
          width: "100%",
        })}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={product.image}
          alt={product.name}
          style={style({
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: isHovered ? 0 : 1,
            transition: "opacity 0.3s ease-in-out",
            position: "absolute",
            top: 0,
            left: 0,
          })}
        />
        {hoverImage && (
          <img
            src={hoverImage}
            alt={`${product.name} hover`}
            style={style({
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
              position: "absolute",
              top: 0,
              left: 0,
            })}
          />
        )}
        {!product.inStock && (
          <div
            style={style({
              position: "absolute",
              top: 8,
              right: 8,
            })}
          >
            <Badge variant="negative">Out of Stock</Badge>
          </div>
        )}
        <div
          style={style({
            position: "absolute",
            top: 8,
            left: 8,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          })}
        >
          {product.isNew && (
            <Badge variant="informative">NEW</Badge>
          )}
          {product.salePercentage && (
            <Badge variant="positive">
              {product.salePercentage}% OFF
            </Badge>
          )}
          {!product.salePercentage && product.originalPrice && product.originalPrice > product.price && (
            <Badge variant="positive">
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </Badge>
          )}
        </div>
      </div>

      <div style={style({ marginTop: 24, padding: 0, textAlign: "center" })}>
        <div style={style({ display: "flex", alignItems: "center", justifyContent: "center" })}>
          <Text
            styles={style({
              fontWeight: "bold",
              color: "white",
              marginBottom: 8,
            })}
          >
            {product.name}
          </Text>
        </div>
      </div>

      <div style={style({ paddingX: 0, textAlign: "center" })}>
        <Text
          styles={style({
            color: "[#A1978D]",
            fontSize: "[0.875rem]",
            marginBottom: 12,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: "[1.5]",
            maxHeight: "[2.625rem]",
          })}
        >
          {product.description}
        </Text>

        <div style={style({ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 16, marginBottom: 16, justifyContent: "center" })}>
          {product.properties.slice(0, 3).map((property) => (
            <BadgeTag key={property} label={property} color={getBadgeColor(property)} />
          ))}
        </div>

        <div style={style({ display: "flex", alignItems: "baseline", gap: 4, justifyContent: "center" })}>
          <Text
            styles={style({
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
      </div>
    </div>
  );
};
