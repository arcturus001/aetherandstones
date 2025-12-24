import { Text, Divider } from "./ui";
import { style } from "../utils/styles";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer
      style={{
        ...style({
          borderTop: "1px solid",
          borderTopColor: "[#2E2E2E]",
          padding: 32,
          paddingTop: 40,
          marginTop: "auto",
        }),
        backgroundColor: "#141414",
      }}
    >
      <div
        style={style({
          maxWidth: 1200,
          marginX: "auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 32,
        })}
      >
        {/* Brand */}
        <div>
          <Text
            styles={style({
              font: "title",
              fontWeight: "bold",
              color: "var(--primarycolor)",
              marginBottom: 16,
              display: "block",
            })}
          >
            Aether & Stones
          </Text>
          <div style={style({ display: "flex", flexDirection: "column", gap: 4 })}>
            <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", display: "block" })}>
              Hand-finished stone bracelets crafted to amplify how you feel.
            </Text>
            <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", display: "block" })}>
              Each piece is designed to channel the energy you need most.
            </Text>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <Text styles={style({ fontWeight: "bold", marginBottom: 16, color: "var(--primarycolor)" })}>
            Quick Links
          </Text>
          <div style={style({ display: "flex", flexDirection: "column", gap: 12 })}>
            <Link to="/shop" style={style({ textDecoration: "none" })}>
              <Text styles={style({ color: "[rgba(255, 255, 255, 0.5)]" })}>Shop Collection</Text>
            </Link>
            <Link to="/energy" style={style({ textDecoration: "none" })}>
              <Text styles={style({ color: "[rgba(255, 255, 255, 0.5)]" })}>Energy Guide</Text>
            </Link>
            <Link to="/about" style={style({ textDecoration: "none" })}>
              <Text styles={style({ color: "[rgba(255, 255, 255, 0.5)]" })}>Our Story</Text>
            </Link>
            <Link to="/shipping" style={style({ textDecoration: "none" })}>
              <Text styles={style({ color: "[rgba(255, 255, 255, 0.5)]" })}>Shipping & Returns</Text>
            </Link>
          </div>
        </div>

        {/* Support */}
        <div>
          <Text styles={style({ fontWeight: "bold", marginBottom: 16, color: "var(--primarycolor)" })}>
            Support
          </Text>
          <div style={style({ display: "flex", flexDirection: "column", gap: 12 })}>
            <Link to="/contact" style={style({ textDecoration: "none" })}>
              <Text styles={style({ color: "[rgba(255, 255, 255, 0.5)]" })}>Contact Us</Text>
            </Link>
            <Link to="/faq" style={style({ textDecoration: "none" })}>
              <Text styles={style({ color: "[rgba(255, 255, 255, 0.5)]" })}>FAQ</Text>
            </Link>
            <Link to="/care" style={style({ textDecoration: "none" })}>
              <Text styles={style({ color: "[rgba(255, 255, 255, 0.5)]" })}>Care Guide</Text>
            </Link>
            <Link to="/warranty" style={style({ textDecoration: "none" })}>
              <Text styles={style({ color: "[rgba(255, 255, 255, 0.5)]" })}>Warranty</Text>
            </Link>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <Text styles={style({ fontWeight: "bold", marginBottom: 16, color: "var(--primarycolor)" })}>
            Stay Connected
          </Text>
          <div style={{ paddingBottom: 32, marginTop: 16 }}>
            <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]" })}>
              Get updates on new collections and energy insights.
            </Text>
          </div>
          <div style={style({ display: "flex", gap: 8 })}>
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                flex: 1,
              }}
            />
            <button
              style={{
                padding: "8px 16px",
                backgroundColor: "var(--primarycolor)",
                color: "#050505",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <Divider style={style({ marginTop: 32, marginBottom: 32 })} className="footer-divider" />

      <div
        style={style({
          maxWidth: 1200,
          marginX: "auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        })}
      >
        <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[0.875rem]" })}>
          © 2024 Aether & Stones. All rights reserved.
        </Text>
          <div style={style({ display: "flex", gap: 16 })}>
            <Text styles={style({ color: "[rgba(255, 255, 255, 0.5)]" })}>Privacy Policy</Text>
            <Text styles={style({ color: "[rgba(255, 255, 255, 0.5)]" })}>Terms of Service</Text>
          </div>
      </div>
    </footer>
  );
};
