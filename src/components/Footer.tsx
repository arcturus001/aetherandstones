import { Text, Divider } from "./ui";
import { style } from "../utils/styles";
import { Link } from "react-router-dom";
import { useState } from "react";
import { subscribeEmail } from "../utils/subscriptions";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setSubscribeStatus({
        type: "error",
        message: "Please enter a valid email address",
      });
      return;
    }

    setIsSubmitting(true);
    setSubscribeStatus({ type: null, message: "" });

    try {
      const result = await subscribeEmail(email, undefined, "footer");
      
      if (result.success) {
        // Show success message
        setSubscribeStatus({
          type: "success",
          message: "Thank you! You've been subscribed successfully.",
        });
        // Clear the email input immediately
        setEmail("");
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSubscribeStatus({ type: null, message: "" });
        }, 5000);
      } else {
        setSubscribeStatus({
          type: "error",
          message: result.error || "Failed to subscribe. Please try again.",
        });
      }
    } catch (error) {
      setSubscribeStatus({
        type: "error",
        message: "An error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
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
          <form onSubmit={handleSubscribe} style={style({ display: "flex", flexDirection: "column", gap: 8 })}>
            <div style={style({ display: "flex", gap: 8 })}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
                style={{
                  padding: "8px 12px",
                  border: subscribeStatus.type === "error" 
                    ? "1px solid #ef4444" 
                    : "1px solid #2E2E2E",
                  borderRadius: "4px",
                  flex: 1,
                  backgroundColor: "#0a0a0a",
                  color: "white",
                  fontSize: "14px",
                }}
              />
              <button
                type="submit"
                disabled={isSubmitting || !email}
                style={{
                  padding: "8px 16px",
                  backgroundColor: isSubmitting || !email 
                    ? "rgba(203, 109, 71, 0.5)" 
                    : "var(--primarycolor)",
                  color: "#050505",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isSubmitting || !email ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  transition: "background-color 0.2s",
                }}
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </button>
            </div>
            {subscribeStatus.type && (
              <div
                style={style({
                  padding: "8px 12px",
                  borderRadius: "4px",
                  backgroundColor: subscribeStatus.type === "success" 
                    ? "rgba(16, 185, 129, 0.1)" 
                    : "rgba(239, 68, 68, 0.1)",
                  border: `1px solid ${subscribeStatus.type === "success" ? "#10b981" : "#ef4444"}`,
                  marginTop: 8,
                })}
              >
                <Text
                  styles={style({
                    color: subscribeStatus.type === "success" 
                      ? "#10b981" 
                      : "#ef4444",
                    fontSize: "[0.875rem]",
                    fontWeight: subscribeStatus.type === "success" ? "500" : "400",
                  })}
                >
                  {subscribeStatus.message}
                </Text>
              </div>
            )}
          </form>
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
