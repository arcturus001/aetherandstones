import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Text, Heading, Button, Badge } from "../../components/ui";
import { style } from "../../utils/styles";
import { getUserOrders, type RecentOrder } from "../../utils/orders";
import { getCurrentUser } from "../../utils/auth";
import { OrderSkeleton } from "../../components/LoadingSkeleton";
import type { OrderItem } from "../../utils/mockData";

export const AccountOrders = () => {
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      const user = await getCurrentUser();
      if (!user) return;

      try {
        const userOrders = await getUserOrders(user.id);
        setOrders(userOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();

    // Listen for order updates
    const handleOrderUpdate = async () => {
      const user = await getCurrentUser();
      if (user) {
        const userOrders = await getUserOrders(user.id);
        setOrders(userOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    };

    window.addEventListener("order-status-updated", handleOrderUpdate);
    return () => window.removeEventListener("order-status-updated", handleOrderUpdate);
  }, []);

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

  if (isLoading) {
    return (
      <div style={style({ display: "flex", flexDirection: "column", gap: 24 })}>
        <Heading
          level={2}
          styles={style({
            fontSize: "[24px]",
            fontWeight: "bold",
            color: "white",
          })}
        >
          Order History
        </Heading>
        <div style={style({ display: "flex", flexDirection: "column", gap: 16 })}>
          {[1, 2, 3].map((i) => (
            <OrderSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
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
  );
};

