import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { PageHero } from "../components/PageHero";
import { Text, Heading, Button, ActionButton } from "../components/ui";
import { style } from "../utils/styles";
import { getProducts } from "../utils/products";
import {
  getCartItems,
  removeFromCart,
  updateCartQuantity,
  getCartTotal,
  type CartItem,
} from "../utils/cart";
import { primarycolor } from "../styles/primaryColor";
import { ShippingProgressMeter } from "../components/ShippingProgressMeter";

const Cart = () => {
  const products = getProducts();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartProducts, setCartProducts] = useState(
    cartItems.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return { ...item, product };
    })
  );

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

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
    const items = getCartItems();
    setCartItems(items);
    setCartProducts(
      items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return { ...item, product };
      })
    );
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateCartQuantity(productId, newQuantity);
    const items = getCartItems();
    setCartItems(items);
    setCartProducts(
      items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return { ...item, product };
      })
    );
  };

  const subtotal = getCartTotal(cartItems, products);
  const shippingThreshold = 500;
  const shipping = subtotal >= shippingThreshold ? 0 : 15;
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
            title="Your Cart"
            subtitle="Your cart is empty."
            disclaimer="Add some beautiful stone bracelets to get started."
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
        <PageHero title="Your Cart" subtitle="Review your items and proceed to checkout." />

        <section
          style={style({
            maxWidth: "[1200px]",
            marginX: "auto",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 700px), 1fr))",
            gap: 48,
            alignItems: "start",
          })}
        >
          {/* Cart Items */}
          <div style={style({ display: "flex", flexDirection: "column", gap: 24 })}>
            <Heading
              level={2}
              styles={style({
                fontSize: "[24px]",
                fontWeight: "bold",
                color: "white",
                marginBottom: 8,
              })}
            >
              Cart Items ({cartItems.length})
            </Heading>

            <ShippingProgressMeter currentTotal={subtotal} threshold={shippingThreshold} />

            <div style={style({ display: "flex", flexDirection: "column", gap: 16 })}>
              {cartProducts.map(({ productId, quantity, product }) => {
                if (!product) return null;

                return (
                  <div
                    key={productId}
                    style={style({
                      display: "flex",
                      gap: 16,
                      padding: 24,
                      backgroundColor: "[#141414]",
                      border: "[1px solid #2E2E2E]",
                      borderRadius: "[8px]",
                    })}
                  >
                    <Link
                      to={`/product/${productId}`}
                      style={style({
                        textDecoration: "none",
                        flexShrink: 0,
                      })}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: 120,
                          height: 120,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    </Link>

                    <div
                      style={style({
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      })}
                    >
                      <div
                        style={style({
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                        })}
                      >
                        <div style={style({ display: "flex", flexDirection: "column", gap: 4 })}>
                          <Link
                            to={`/product/${productId}`}
                            style={style({ textDecoration: "none", color: "inherit" })}
                          >
                            <Heading
                              level={3}
                              styles={style({
                                fontSize: "[18px]",
                                fontWeight: "600",
                                color: "white",
                                margin: 0,
                              })}
                            >
                              {product.name}
                            </Heading>
                          </Link>
                          <Text
                            styles={style({
                              fontSize: "[14px]",
                              color: "[rgba(255, 255, 255, 0.6)]",
                            })}
                          >
                            {product.stone}
                          </Text>
                        </div>
                        <ActionButton
                          onClick={() => handleRemove(productId)}
                          aria-label="Remove item"
                          styles={style({
                            color: "red",
                            padding: "8px 12px",
                            minWidth: "auto",
                            fontSize: "[16px]",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          })}
                        >
                          <Text styles={style({ color: "red", fontSize: "[14px]" })}>Remove</Text>
                          <span style={{ fontSize: "20px", fontWeight: "bold" }}>×</span>
                        </ActionButton>
                      </div>

                      <div
                        style={style({
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "auto",
                        })}
                      >
                        <div style={style({ display: "flex", alignItems: "center", gap: 12 })}>
                          <Text
                            styles={style({
                              fontSize: "[14px]",
                              color: "[rgba(255, 255, 255, 0.7)]",
                            })}
                          >
                            Quantity:
                          </Text>
                          <div
                            style={style({
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              border: "[1px solid rgba(255, 255, 255, 0.2)]",
                              borderRadius: "[4px]",
                              padding: "4px 8px",
                            })}
                          >
                            <ActionButton
                              onClick={() => handleQuantityChange(productId, quantity - 1)}
                              aria-label="Decrease quantity"
                              styles={style({
                                padding: "2px 8px",
                                minWidth: "auto",
                                fontSize: "[18px]",
                              })}
                            >
                              −
                            </ActionButton>
                            <Text
                              styles={style({
                                fontSize: "[16px]",
                                fontWeight: "600",
                                color: "white",
                                minWidth: "[24px]",
                                textAlign: "center",
                              })}
                            >
                              {quantity}
                            </Text>
                            <ActionButton
                              onClick={() => handleQuantityChange(productId, quantity + 1)}
                              aria-label="Increase quantity"
                              styles={style({
                                padding: "2px 8px",
                                minWidth: "auto",
                                fontSize: "[18px]",
                              })}
                            >
                              +
                            </ActionButton>
                          </div>
                        </div>

                        <div style={style({ display: "flex", flexDirection: "column", alignItems: "end" })}>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <Text
                              styles={style({
                                fontSize: "[14px]",
                                color: "[rgba(255, 255, 255, 0.4)]",
                                textDecoration: "line-through",
                              })}
                            >
                              ${product.originalPrice * quantity}
                            </Text>
                          )}
                          <Text
                            styles={style({
                              fontSize: "[20px]",
                              fontWeight: "bold",
                              color: "white",
                            })}
                          >
                            ${(product.price * quantity).toFixed(2)}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
                <Text styles={style({ color: "[rgba(255, 255, 255, 0.7)]" })}>Shipping</Text>
                <Text styles={style({ color: "white", fontWeight: "600" })}>
                  {shipping === 0 ? (
                    <span style={{ color: primarycolor }}>Free</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </Text>
              </div>

              {subtotal < 500 && (
                <Text
                  styles={style({
                    fontSize: "[12px]",
                    color: "[rgba(255, 255, 255, 0.5)]",
                    fontStyle: "italic",
                  })}
                >
                  Add ${(500 - subtotal).toFixed(2)} more for free shipping
                </Text>
              )}

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

            <Link to="/checkout" style={style({ textDecoration: "none", width: "100%" })}>
              <Button
                variant="accent"
                size="L"
                styles={style({
                  width: "100%",
                  marginTop: 8,
                })}
              >
                Proceed to Checkout
              </Button>
            </Link>

            <Link to="/shop" style={style({ textDecoration: "none", width: "100%" })}>
              <Button
                variant="secondary"
                size="L"
                styles={style({
                  width: "100%",
                })}
              >
                Continue Shopping
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;

