import { Link, useLocation } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { PageHero } from "../components/PageHero";
import { Text, Heading, Button } from "../components/ui";
import { style } from "../utils/styles";
import { type OrderDetails } from "../utils/email";
import { isUserLoggedIn } from "../utils/userAuth";
import { primarycolor } from "../styles/primaryColor";

const OrderSuccess = () => {
  const location = useLocation();
  const orderDetails = location.state?.orderDetails as OrderDetails | undefined;
  const orderId = location.state?.orderId as string | undefined;
  const needsLogin = location.state?.needsLogin as boolean | undefined;
  const isLoggedIn = isUserLoggedIn();

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
          title="Order Confirmed!"
          subtitle="Thank you for your purchase."
          disclaimer={
            needsLogin && !isLoggedIn
              ? "Create an account or login to track your order status and view order history."
              : "We've sent you a confirmation email. Your order will be processed and shipped soon."
          }
        />

        {needsLogin && !isLoggedIn && (
          <div
            style={style({
              maxWidth: "[600px]",
              width: "100%",
              padding: 32,
              backgroundColor: "[#141414]",
              border: `[2px solid ${primarycolor}]`,
              borderRadius: "[8px]",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              textAlign: "center",
            })}
          >
            <Heading
              level={3}
              styles={style({
                fontSize: "[20px]",
                fontWeight: "bold",
                color: "white",
              })}
            >
              Track Your Order
            </Heading>
            <Text styles={style({ color: "[rgba(255, 255, 255, 0.7)]" })}>
              Create an account or login to view your order status, track shipping, and access your order history.
            </Text>
            {orderId && (
              <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[14px]", marginTop: 8 })}>
                Order ID: {orderId}
              </Text>
            )}
            <div style={style({ display: "flex", gap: 12, justifyContent: "center", marginTop: 8, flexWrap: "wrap" })}>
              <Link
                to="/login"
                state={{ redirectTo: "/account" }}
                style={style({ textDecoration: "none" })}
              >
                <Button variant="accent" size="M">
                  Create Account / Login
                </Button>
              </Link>
            </div>
          </div>
        )}

        {isLoggedIn && (
          <div
            style={style({
              maxWidth: "[600px]",
              width: "100%",
              padding: 24,
              backgroundColor: "[#141414]",
              border: "[1px solid #2E2E2E]",
              borderRadius: "[8px]",
              textAlign: "center",
            })}
          >
            <Text styles={style({ color: "[rgba(255, 255, 255, 0.7)]", marginBottom: 16 })}>
              Your order has been saved to your account.
            </Text>
            <Link to="/account" style={style({ textDecoration: "none" })}>
              <Button variant="accent" size="M">
                View My Orders
              </Button>
            </Link>
          </div>
        )}

        {orderDetails && (
          <div
            style={style({
              maxWidth: "[600px]",
              width: "100%",
              padding: 32,
              backgroundColor: "[#141414]",
              border: "[1px solid #2E2E2E]",
              borderRadius: "[8px]",
              display: "flex",
              flexDirection: "column",
              gap: 24,
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
              Order Summary
            </Heading>

            <div style={style({ display: "flex", flexDirection: "column", gap: 12 })}>
              <Text styles={style({ color: "[rgba(255, 255, 255, 0.7)]" })}>
                <strong>Shipping to:</strong>
              </Text>
              <Text styles={style({ color: "white", lineHeight: "[1.6]" })}>
                {orderDetails.shipping.fullName}
                <br />
                {orderDetails.shipping.address}
                <br />
                {orderDetails.shipping.city}, {orderDetails.shipping.state}{" "}
                {orderDetails.shipping.postalCode}
                <br />
                {orderDetails.shipping.country}
              </Text>
            </div>

            <div
              style={style({
                borderTop: "[1px solid #2E2E2E]",
                paddingTop: 16,
                marginTop: 8,
              })}
            >
              <Text styles={style({ color: "white", fontWeight: "600" })}>
                Total: ${orderDetails.total.toFixed(2)}
              </Text>
            </div>
          </div>
        )}

        <div style={style({ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" })}>
          <Link to="/shop" style={style({ textDecoration: "none" })}>
            <Button variant="accent" size="L">
              Continue Shopping
            </Button>
          </Link>
          <Link to="/" style={style({ textDecoration: "none" })}>
            <Button variant="secondary" size="L">
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderSuccess;

