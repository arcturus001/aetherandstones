import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { PageHero } from "../components/PageHero";
import { Text, Heading, Button, TextField } from "../components/ui";
import { style } from "../utils/styles";
import { getProducts } from "../utils/products";
import {
  getCartItems,
  getCartTotal,
  type CartItem,
} from "../utils/cart";
import { primarycolor } from "../styles/primaryColor";

const Checkout = () => {
  const products = getProducts();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartProducts, setCartProducts] = useState(
    cartItems.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return { ...item, product };
    })
  );

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const [shippingMethod, setShippingMethod] = useState<"express" | "standard">("standard");

  useEffect(() => {
    const items = getCartItems();
    setCartItems(items);
    setCartProducts(
      items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return { ...item, product };
      })
    );
  }, []);

  const subtotal = getCartTotal(cartItems, products);
  const shippingThreshold = 500;
  const isFreeShippingEligible = subtotal >= shippingThreshold;

  useEffect(() => {
    const items = getCartItems();
    setCartItems(items);
    setCartProducts(
      items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return { ...item, product };
      })
    );
  }, []);

  useEffect(() => {
    if (isFreeShippingEligible) {
      setShippingMethod("express");
    }
  }, [isFreeShippingEligible]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission - would navigate to payment page
    console.log("Form submitted:", formData, { shippingMethod });
  };

  const shipping = isFreeShippingEligible ? 0 : (shippingMethod === "express" ? 30 : 10);
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div
        style={style({
          minHeight: "[100vh]",
          backgroundColor: "black",
          color: "white",
          display: "flex",
          flexDirection: "column",
        })}
      >
        <Header />
        <main
          style={style({
            flex: 1,
            padding: "[64px 16px 80px]",
            display: "flex",
            flexDirection: "column",
            gap: 48,
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <PageHero
            title="Checkout"
            subtitle="Your cart is empty."
            disclaimer="Add some items to your cart to proceed."
          />
          <Link to="/shop" style={style({ textDecoration: "none" })}>
            <Button variant="accent" size="L">
              Continue Shopping
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div
      style={style({
        minHeight: "[100vh]",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
      })}
    >
      <Header />
      <main
        style={style({
          flex: 1,
          padding: "[64px 16px 80px]",
          display: "flex",
          flexDirection: "column",
          gap: 48,
        })}
      >
        <PageHero title="Checkout" subtitle="Complete your order with secure payment." />

        <section
          style={style({
            maxWidth: "[1200px]",
            marginX: "auto",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "minmax(400px, 500px) 1fr",
            gap: 64,
            alignItems: "start",
          })}
          className="checkout-grid"
        >
          {/* Shipping Information Form */}
          <div style={style({ display: "flex", flexDirection: "column", gap: 32 })}>
            <div style={style({ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 })}>
              <Link
                to="/cart"
                style={style({
                  textDecoration: "none",
                  color: "[rgba(255, 255, 255, 0.7)]",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                })}
              >
                <span style={{ fontSize: "18px" }}>←</span>
                <Text styles={style({ fontSize: "[14px]", color: "[rgba(255, 255, 255, 0.7)]" })}>
                  Back to Cart
                </Text>
              </Link>
            </div>

            <Heading
              level={2}
              styles={style({
                fontSize: "[28px]",
                fontWeight: "bold",
                color: "white",
                marginBottom: 8,
              })}
            >
              Shipping Information
            </Heading>

            <form onSubmit={handleSubmit} style={style({ display: "flex", flexDirection: "column", gap: 20 })}>
              {/* Shipping Method Selection */}
              <div style={style({ display: "flex", flexDirection: "column", gap: 12, marginBottom: 8 })}>
                <Text
                  styles={style({
                    fontSize: "[14px]",
                    fontWeight: "600",
                    color: "white",
                    marginBottom: 8,
                  })}
                >
                  Shipping Method *
                </Text>
                <div style={style({ display: "flex", flexDirection: "column", gap: 12 })}>
                  <label
                    style={style({
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 12,
                      borderRadius: 8,
                      border: shippingMethod === "express" ? "[2px solid #CB6D47]" : "[1px solid rgba(255, 255, 255, 0.2)]",
                      backgroundColor: shippingMethod === "express" ? "[rgba(209, 169, 91, 0.1)]" : "[rgba(255, 255, 255, 0.05)]",
                      cursor: isFreeShippingEligible ? "not-allowed" : "pointer",
                      opacity: isFreeShippingEligible ? 0.6 : 1,
                    })}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="express"
                      checked={shippingMethod === "express"}
                      onChange={(e) => setShippingMethod(e.target.value as "express" | "standard")}
                      disabled={isFreeShippingEligible}
                      style={{
                        width: 18,
                        height: 18,
                        cursor: isFreeShippingEligible ? "not-allowed" : "pointer",
                      }}
                    />
                    <div style={style({ flex: 1, display: "flex", flexDirection: "column", gap: 4 })}>
                      <Text styles={style({ fontSize: "[14px]", fontWeight: "600", color: "white" })}>
                        Express Shipping
                        {isFreeShippingEligible && (
                          <span style={{ color: primarycolor, marginLeft: 8 }}>(FREE)</span>
                        )}
                      </Text>
                      <Text styles={style({ fontSize: "[12px]", color: "[rgba(255, 255, 255, 0.6)]" })}>
                        {isFreeShippingEligible
                          ? "Free express shipping on orders over $500"
                          : "Fast delivery - $30.00"}
                      </Text>
                    </div>
                  </label>
                  <label
                    style={style({
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 12,
                      borderRadius: 8,
                      border: shippingMethod === "standard" ? "[2px solid #CB6D47]" : "[1px solid rgba(255, 255, 255, 0.2)]",
                      backgroundColor: shippingMethod === "standard" ? "[rgba(209, 169, 91, 0.1)]" : "[rgba(255, 255, 255, 0.05)]",
                      cursor: "pointer",
                    })}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="standard"
                      checked={shippingMethod === "standard"}
                      onChange={(e) => setShippingMethod(e.target.value as "express" | "standard")}
                      disabled={isFreeShippingEligible}
                      style={{
                        width: 18,
                        height: 18,
                        cursor: isFreeShippingEligible ? "not-allowed" : "pointer",
                      }}
                    />
                    <div style={style({ flex: 1, display: "flex", flexDirection: "column", gap: 4 })}>
                      <Text styles={style({ fontSize: "[14px]", fontWeight: "600", color: "white" })}>
                        Standard Shipping
                      </Text>
                      <Text styles={style({ fontSize: "[12px]", color: "[rgba(255, 255, 255, 0.6)]" })}>
                        Regular delivery - $10.00
                      </Text>
                    </div>
                  </label>
                </div>
              </div>

              <TextField
                label="Full Name"
                isRequired
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="John Doe"
              />
              <TextField
                label="Email"
                type="email"
                isRequired
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="john@example.com"
              />
              <TextField
                label="Address"
                isRequired
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="123 Crystal Lane"
              />
              <div style={style({ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 })}>
                <TextField
                  label="City"
                  isRequired
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="San Francisco"
                />
                <TextField
                  label="State"
                  isRequired
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="CA"
                />
              </div>
              <div style={style({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 })}>
                <TextField
                  label="Postal Code"
                  isRequired
                  value={formData.postalCode}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                  placeholder="94102"
                />
                <TextField
                  label="Country"
                  isRequired
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  placeholder="US"
                />
              </div>

              {/* Payment Information Section */}
              <div style={style({ paddingTop: 20, borderTop: "[1px solid #2E2E2E]" })}>
                <Heading
                  level={3}
                  styles={style({
                    fontSize: "[24px]",
                    fontWeight: "bold",
                    color: "white",
                    marginBottom: 20,
                  })}
                >
                  Payment Information
                </Heading>

                <div style={style({ display: "flex", flexDirection: "column", gap: 16 })}>
                  <TextField
                    label="Card Number"
                    isRequired
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => {
                      // Format card number with spaces every 4 digits
                      const value = e.target.value.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
                      handleChange("cardNumber", value);
                    }}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />

                  <div style={style({ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 })}>
                    <TextField
                      label="Expiry Date"
                      isRequired
                      type="text"
                      value={formData.expiryDate}
                      onChange={(e) => {
                        // Format expiry date as MM/YY
                        let value = e.target.value.replace(/\D/g, "");
                        if (value.length >= 2) {
                          value = value.substring(0, 2) + "/" + value.substring(2, 4);
                        }
                        handleChange("expiryDate", value);
                      }}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                    <TextField
                      label="CVV"
                      isRequired
                      type="text"
                      value={formData.cvv}
                      onChange={(e) => {
                        // Only allow numbers, max 4 digits
                        const value = e.target.value.replace(/\D/g, "").substring(0, 4);
                        handleChange("cvv", value);
                      }}
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>

                  <TextField
                    label="Cardholder Name"
                    isRequired
                    value={formData.cardholderName}
                    onChange={(e) => handleChange("cardholderName", e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div
            style={style({
              display: "flex",
              flexDirection: "column",
              gap: 24,
              padding: 32,
              backgroundColor: "[#141414]",
              border: "[1px solid #2E2E2E]",
              borderRadius: "[8px]",
              height: "fit-content",
              position: "sticky",
              top: 100,
            })}
          >
            <Heading
              level={2}
              styles={style({
                fontSize: "[24px]",
                fontWeight: "bold",
                color: "white",
                marginBottom: 8,
              })}
            >
              Order Summary
            </Heading>

            <div style={style({ display: "flex", flexDirection: "column", gap: 16 })}>
              {cartProducts.map(({ productId, quantity, product }) => {
                if (!product) return null;

                return (
                  <div
                    key={productId}
                    style={style({
                      display: "flex",
                      gap: 12,
                      paddingBottom: 16,
                      borderBottom: "[1px solid #2E2E2E]",
                    })}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                    <div style={style({ flex: 1, display: "flex", flexDirection: "column", gap: 4 })}>
                      <Text
                        styles={style({
                          fontSize: "[14px]",
                          fontWeight: "600",
                          color: "white",
                        })}
                      >
                        {product.name}
                      </Text>
                      <Text
                        styles={style({
                          fontSize: "[12px]",
                          color: "[rgba(255, 255, 255, 0.6)]",
                        })}
                      >
                        Qty: {quantity}
                      </Text>
                      <Text
                        styles={style({
                          fontSize: "[14px]",
                          fontWeight: "600",
                          color: "white",
                          marginTop: "auto",
                        })}
                      >
                        ${(product.price * quantity).toFixed(2)}
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={style({ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 })}>
              <div
                style={style({
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                })}
              >
                <Text styles={style({ color: "[rgba(255, 255, 255, 0.7)]" })}>Subtotal</Text>
                <Text styles={style({ color: "white", fontWeight: "600" })}>
                  ${subtotal.toFixed(2)}
                </Text>
              </div>

              <div
                style={style({
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                })}
              >
                <Text styles={style({ color: "[rgba(255, 255, 255, 0.7)]" })}>
                  Shipping ({shippingMethod === "express" ? "Express" : "Standard"})
                </Text>
                <Text styles={style({ color: "white", fontWeight: "600" })}>
                  {shipping === 0 ? (
                    <span style={{ color: primarycolor }}>FREE</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </Text>
              </div>

              <div
                style={style({
                  borderTop: "[1px solid #2E2E2E]",
                  paddingTop: 16,
                  marginTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                })}
              >
                <Text
                  styles={style({
                    fontSize: "[18px]",
                    fontWeight: "bold",
                    color: "white",
                  })}
                >
                  Total
                </Text>
                <Text
                  styles={style({
                    fontSize: "[24px]",
                    fontWeight: "bold",
                    color: "white",
                  })}
                >
                  ${total.toFixed(2)}
                </Text>
              </div>
            </div>

            <div style={style({ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 })}>
              <div style={style({ display: "flex", alignItems: "center", gap: 8 })}>
                <span style={{ fontSize: "16px" }}>🔒</span>
                <Text styles={style({ fontSize: "[12px]", color: "[rgba(255, 255, 255, 0.6)]" })}>
                  Secure payment powered by Stripe
                </Text>
              </div>
              <div style={style({ display: "flex", alignItems: "center", gap: 8 })}>
                <span style={{ fontSize: "16px" }}>📦</span>
                <Text styles={style({ fontSize: "[12px]", color: "[rgba(255, 255, 255, 0.6)]" })}>
                  Free shipping on orders over ${shippingThreshold}
                </Text>
              </div>
              <div style={style({ display: "flex", alignItems: "center", gap: 8 })}>
                <span style={{ fontSize: "16px" }}>✨</span>
                <Text styles={style({ fontSize: "[12px]", color: "[rgba(255, 255, 255, 0.6)]" })}>
                  All crystals ethically sourced
                </Text>
              </div>
            </div>

            <Button
              type="button"
              variant="accent"
              size="L"
              onClick={handleSubmit}
              styles={style({
                width: "100%",
                marginTop: 16,
              })}
            >
              Pay ${total.toFixed(2)}
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;

