import {
  ActionButton,
  SearchField,
  Text,
} from "@react-spectrum/s2";
import Cart from "@react-spectrum/s2/icons/ShoppingCart";
import { primarycolor } from "../styles/primaryColor";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

const cartButtonStyles: CSSProperties & Record<string, string> = {
  "--spectrum-actionbutton-background-color-default": "transparent",
  "--spectrum-actionbutton-background-color-hover": "transparent",
  "--spectrum-actionbutton-background-color-focus": "transparent",
  "--spectrum-actionbutton-background-color-active": "transparent",
  "--spectrum-actionbutton-content-color-default": "white",
  "--spectrum-actionbutton-content-color-hover": "white",
  "--spectrum-actionbutton-content-color-focus": "white",
  "--spectrum-actionbutton-padding": "4px 8px",
  "--spectrum-actionbutton-min-height": "auto",
  border: `1px solid ${primarycolor}`,
  borderRadius: "999px",
  padding: "2px",
  backgroundColor: "black",
  color: "white",
  "--iconPrimary": "white",
};
export const Header = () => {
  return (
    <header
      className={style({
        zIndex: 999,
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "[rgba(0, 0, 0, 0.65)]",
        backgroundClip: "padding-box",
        borderBottom: "1px solid",
        borderBottomColor: "gray-200",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      })}
      style={{
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        width: "100%",
        padding: "16px 24px",
        height: 80,
      }}
    >
      {/* Logo and brand */}
      <Link to="/" className={style({ textDecoration: "none", color: "inherit" })}>
        <div className={style({ display: "flex", alignItems: "center", gap: 12, height: 30 })}>
          <Text
            styles={style({
              fontFamily: "[\"Playfair Display\"]",
              fontSize: "[30px]",
              fontWeight: "[100]",
              color: "[rgba(255, 255, 255, 1)]",
              lineHeight: "[1.5]",
            })}
          >
            Aether & Stones
          </Text>
        </div>
      </Link>

      {/* Navigation */}
      <div className={style({
        flex: 1,
        display: "flex",
        justifyContent: "center",
      })}>
        <nav className={style({
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          overflowX: "auto",
          width: "100%",
          maxWidth: 1200,
          marginX: "auto",
        })}>
        <ActionButton isQuiet>
          <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Text styles={style({ color: "white" })}>Home</Text>
          </a>
        </ActionButton>
        <ActionButton isQuiet>
          <a href="/shop" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Text styles={style({ color: "white" })}>Shop</Text>
          </a>
        </ActionButton>
        <ActionButton isQuiet>
          <a href="/energy" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Text styles={style({ color: "white" })}>Energy Guide</Text>
          </a>
        </ActionButton>
        <ActionButton isQuiet>
          <a href="/about" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Text styles={style({ color: "white" })}>About</Text>
          </a>
        </ActionButton>
      </nav>
      </div>

      {/* Search and Cart */}
      <div className={style({ display: "flex", alignItems: "center", gap: 12 })}>
        <div style={{ opacity: 0 }}>
          <SearchField
            aria-label="Search products"
            placeholder="Search stones..."
            styles={style({ width: 200 })}
          />
        </div>
        <div style={cartButtonStyles} className="cart-button-wrapper">
          <ActionButton aria-label="Shopping cart" isQuiet>
            <Cart />
          </ActionButton>
        </div>
      </div>
    </header>
  );
};
