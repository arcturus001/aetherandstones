import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { PageHero } from "../components/PageHero";
import { Text, Heading, Button, Badge } from "../components/ui";
import { style } from "../utils/styles";
import { getCurrentUser, logoutUser, isUserLoggedIn } from "../utils/userAuth";
import { getUserOrders, type RecentOrder } from "../utils/orders";
import type { User } from "../utils/userAuth";
import type { OrderItem } from "../utils/mockData";

const Account = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
      navigate("/login", { state: { redirectTo: "/account" } });
      return;
    }

    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      const userOrders = getUserOrders(currentUser.id);
      setOrders(userOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }

    // Listen for order updates
    const handleOrderUpdate = () => {
      if (currentUser) {
        const userOrders = getUserOrders(currentUser.id);
        setOrders(userOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    };

    window.addEventListener("order-status-updated", handleOrderUpdate);
    return () => window.removeEventListener("order-status-updated", handleOrderUpdate);
  }, [navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const getStatusColor = (status: RecentOrder['status']): "positive" | "informative" | "neutral" | "accent" => {
    switch (status) {
      case "delivered":
        return "positive";
      case "shipped":
        return "informative";
      case "gathering":
        return "accent";
      default:
        return "neutral";
    }
  };

  const getStatusLabel = (status: RecentOrder['status']) => {
    switch (status) {
      case "gathering":
        return "Being Prepared";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  if (!user) {
    return null; // Will redirect
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
          maxWidth: "[1200px]",
          marginX: "auto",
          width: "100%",
        })}
      >
        <PageHero
          title="My Account"
          subtitle={`Welcome back, ${user.fullName}`}
        />

        {/* Account Info */}
        <div
          style={style({
            padding: 32,
            backgroundColor: "[#141414]",
            border: "[1px solid #2E2E2E]",
            borderRadius: "[8px]",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          })}
        >
          <Heading
            level={3}
            styles={style({
              fontSize: "[20px]",
              fontWeight: "bold",
              color: "white",
              marginBottom: 8,
            })}
          >
            Account Information
          </Heading>
          <Text styles={style({ color: "[rgba(255, 255, 255, 0.7)]" })}>
            <strong>Name:</strong> {user.fullName}
          </Text>
          <Text styles={style({ color: "[rgba(255, 255, 255, 0.7)]" })}>
            <strong>Email:</strong> {user.email}
          </Text>
          <Text styles={style({ color: "[rgba(255, 255, 255, 0.7)]", fontSize: "[12px]" })}>
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </Text>
          <Button
            variant="secondary"
            size="M"
            onClick={handleLogout}
            styles={style({
              marginTop: 8,
              alignSelf: "flex-start",
            })}
          >
            Logout
          </Button>
        </div>

        {/* Orders */}
        <div style={style({ display: "flex", flexDirection: "column", gap: 24 })}>
          <Heading
            level={2}
            styles={style({
              fontSize: "[24px]",
              fontWeight: "bold",
              color: "white",
            })}
          >
            Order History ({orders.length})
          </Heading>

          {orders.length === 0 ? (
            <div
              style={style({
                padding: 48,
                backgroundColor: "[#141414]",
                border: "[1px solid #2E2E2E]",
                borderRadius: "[8px]",
                textAlign: "center",
              })}
            >
              <Text styles={style({ color: "[rgba(255, 255, 255, 0.7)]", fontSize: "[16px]" })}>
                You haven't placed any orders yet.
              </Text>
              <Link to="/shop" style={style({ textDecoration: "none", marginTop: 16, display: "inline-block" })}>
                <Button variant="accent" size="M">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div style={style({ display: "flex", flexDirection: "column", gap: 16 })}>
              {orders.map((order) => (
                <div
                  key={order.id}
                  style={style({
                    padding: 24,
                    backgroundColor: "[#141414]",
                    border: "[1px solid #2E2E2E]",
                    borderRadius: "[8px]",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  })}
                >
                  <div
                    style={style({
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      flexWrap: "wrap",
                      gap: 16,
                    })}
                  >
                    <div style={style({ display: "flex", flexDirection: "column", gap: 8 })}>
                      <div style={style({ display: "flex", alignItems: "center", gap: 12 })}>
                        <Text
                          styles={style({
                            fontSize: "[18px]",
                            fontWeight: "600",
                            color: "white",
                          })}
                        >
                          Order #{order.id}
                        </Text>
                        <Badge variant={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[14px]" })}>
                        Placed on {new Date(order.date).toLocaleDateString()}
                      </Text>
                    </div>
                    <Text
                      styles={style({
                        fontSize: "[20px]",
                        fontWeight: "bold",
                        color: "white",
                      })}
                    >
                      ${order.total.toFixed(2)}
                    </Text>
                  </div>

                  {/* Order Items */}
                  {order.items && order.items.length > 0 ? (
                    <div style={style({ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 })}>
                      {order.items.map((item: OrderItem, index: number) => (
                        <div
                          key={index}
                          style={style({
                            padding: 12,
                            backgroundColor: "[rgba(255, 255, 255, 0.05)]",
                            borderRadius: "[4px]",
                            display: "flex",
                            justifyContent: "space-between",
                          })}
                        >
                          <div>
                            <Text styles={style({ color: "white", fontWeight: "600" })}>
                              {item.productName}
                            </Text>
                            <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[12px]" })}>
                              Quantity: {item.quantity} × ${item.price.toFixed(2)}
                            </Text>
                          </div>
                          <Text styles={style({ color: "white", fontWeight: "600" })}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </Text>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Legacy support for old order format
                    <Text styles={style({ color: "[rgba(255, 255, 255, 0.7)]" })}>
                      {order.productName} × {order.quantity}
                    </Text>
                  )}

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div
                      style={style({
                        marginTop: 8,
                        paddingTop: 16,
                        borderTop: "[1px solid #2E2E2E]",
                      })}
                    >
                      <Text
                        styles={style({
                          color: "[rgba(255, 255, 255, 0.7)]",
                          fontSize: "[14px]",
                          fontWeight: "600",
                          marginBottom: 4,
                        })}
                      >
                        Shipping Address:
                      </Text>
                      <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[14px]", lineHeight: "[1.6]" })}>
                        {order.shippingAddress.fullName}
                        <br />
                        {order.shippingAddress.address}
                        <br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                        <br />
                        {order.shippingAddress.country}
                      </Text>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;

