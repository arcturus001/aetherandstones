import {
  Text,
  Divider,
  Link as SpectrumLink,
} from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import { homeCopy } from "../data/copy";

export const Footer = () => {
  return (
    <footer
      className={style({
        backgroundColor: "layer-1",
        borderTop: "1px solid",
        borderTopColor: "gray-200",
        padding: 32,
        marginTop: "auto",
      })}
    >
      <div
        className={style({
          maxWidth: 1200,
          marginX: "auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 32,
        })}
      >
        {/* Brand */}
        <div>
          <Text styles={style({ font: "title", fontWeight: "bold", color: "accent", marginBottom: 16 })}>
            Aether & Stones
          </Text>
          <Text styles={style({ color: "neutral-subdued" })}>
            {homeCopy.footerDescription}
          </Text>
        </div>

        {/* Quick Links */}
        <div>
          <Text styles={style({ font: "body", fontWeight: "bold", marginBottom: 16 })}>
            Quick Links
          </Text>
          <div className={style({ display: "flex", flexDirection: "column", gap: 8 })}>
            <SpectrumLink>
              <a href="/shop" style={{ textDecoration: 'none', color: 'inherit' }}>
                Shop Collection
              </a>
            </SpectrumLink>
            <SpectrumLink>
              <a href="/energy" style={{ textDecoration: 'none', color: 'inherit' }}>
                Energy Guide
              </a>
            </SpectrumLink>
            <SpectrumLink>
              <a href="/about" style={{ textDecoration: 'none', color: 'inherit' }}>
                Our Story
              </a>
            </SpectrumLink>
            <SpectrumLink>
              <a href="/shipping" style={{ textDecoration: 'none', color: 'inherit' }}>
                Shipping & Returns
              </a>
            </SpectrumLink>
          </div>
        </div>

        {/* Support */}
        <div>
          <Text styles={style({ font: "body", fontWeight: "bold", marginBottom: 16 })}>
            Support
          </Text>
          <div className={style({ display: "flex", flexDirection: "column", gap: 8 })}>
            <SpectrumLink href="mailto:hello@aetherandstones.com">
              Contact Us
            </SpectrumLink>
            <SpectrumLink>
              <a href="/faq" style={{ textDecoration: 'none', color: 'inherit' }}>
                FAQ
              </a>
            </SpectrumLink>
            <SpectrumLink>
              <a href="/care" style={{ textDecoration: 'none', color: 'inherit' }}>
                Care Guide
              </a>
            </SpectrumLink>
            <SpectrumLink>
              <a href="/warranty" style={{ textDecoration: 'none', color: 'inherit' }}>
                Warranty
              </a>
            </SpectrumLink>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <Text styles={style({ font: "body", fontWeight: "bold", marginBottom: 16 })}>
            Stay Connected
          </Text>
          <Text styles={style({ color: "neutral-subdued", marginBottom: 16 })}>
            Get updates on new collections and energy insights.
          </Text>
          <div className={style({ display: "flex", gap: 8 })}>
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
                backgroundColor: "#1473e6",
                color: "white",
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

      <Divider styles={style({ marginY: 32 })} />

      <div
        className={style({
          maxWidth: 1200,
          marginX: "auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        })}
      >
        <Text styles={style({ color: "neutral-subdued", font: "detail-sm" })}>
          © 2024 Aether & Stones. All rights reserved.
        </Text>
        <div className={style({ display: "flex", gap: 16 })}>
          <SpectrumLink href="#">
            Privacy Policy
          </SpectrumLink>
          <SpectrumLink href="#">
            Terms of Service
          </SpectrumLink>
        </div>
      </div>
    </footer>
  );
};
