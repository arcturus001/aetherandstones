import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { PageHero } from "../components/PageHero";
import { Text, Heading, Button } from "../components/ui";
import { style } from "../utils/styles";
import { type OrderDetails } from "../utils/email";
import { primarycolor } from "../styles/primaryColor";
import { AccountCardSkeleton } from "../components/AccountCardSkeleton";
import { ToastContainer } from "../components/Toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface PostPurchaseStatus {
  hasAccount: boolean;
  needsPassword: boolean;
  emailMasked: string;
  setPasswordUrl?: string;
}

interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
}

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Read orderId from query params (for refresh-safe behavior) or state (for initial navigation)
  const orderId = searchParams.get('orderId') || location.state?.orderId as string | undefined;
  const orderDetails = location.state?.orderDetails as OrderDetails | undefined;
  
  const [status, setStatus] = useState<PostPurchaseStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Add toast helper
  const addToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch post-purchase status
  useEffect(() => {
    const fetchStatus = async () => {
      if (!orderId) {
        setIsLoadingStatus(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/post-purchase-status?orderId=${encodeURIComponent(orderId)}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        } else {
          console.error("Failed to fetch post-purchase status");
        }
      } catch (error) {
        console.error("Error fetching post-purchase status:", error);
      } finally {
        setIsLoadingStatus(false);
      }
    };

    fetchStatus();
  }, [orderId]);

  const handleResendEmail = async () => {
    if (!orderId) return;

    setIsResendingEmail(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/resend-set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.alreadySecured) {
          addToast("You're already secured.", "info");
        } else {
          addToast("Password setup email sent.", "success");
        }
      } else {
        if (response.status === 429) {
          addToast("Please wait before requesting another email.", "error");
        } else {
          addToast("Something went wrong. Try again.", "error");
        }
      }
    } catch (error) {
      console.error("Error resending email:", error);
      addToast("Something went wrong. Try again.", "error");
    } finally {
      setIsResendingEmail(false);
    }
  };

  if (isLoadingStatus) {
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
            title="Your order is confirmed."
            subtitle="Thank you for your purchase."
            disclaimer="We've sent you a confirmation email. Your order will be processed and shipped soon."
          />
          <AccountCardSkeleton />
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
          alignItems: "center",
          justifyContent: "center",
        })}
      >
        <PageHero
          title="Your order is confirmed."
          subtitle={status?.hasAccount 
            ? "Welcome to your Aether & Stones private vault — a secure space for your shipping details and order tracking." 
            : "Thank you for your purchase."}
          disclaimer={status?.hasAccount
            ? "We've created your account automatically using your checkout email."
            : "We've sent you a confirmation email. Your order will be processed and shipped soon."}
        />

        {/* Premium "Complete your account" card */}
        {status?.hasAccount && (
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
            {status.needsPassword ? (
              <>
                <Heading
                  level={3}
                  styles={style({
                    fontSize: "[20px]",
                    fontWeight: "bold",
                    color: "white",
                  })}
                >
                  Secure your vault
                </Heading>
                <Text styles={style({ color: "[rgba(255, 255, 255, 0.7)]" })}>
                  Set a password to track orders and save delivery details.
                </Text>
                <Text styles={style({ color: "[rgba(255, 255, 255, 0.5)]", fontSize: "[12px]", marginTop: 4 })}>
                  Account: {status.emailMasked}
                </Text>
                <div style={style({ display: "flex", gap: 12, justifyContent: "center", marginTop: 8, flexWrap: "wrap" })}>
                  {status.setPasswordUrl ? (
                    <Link
                      to={status.setPasswordUrl.replace(/^https?:\/\/[^/]+/, '')}
                      style={style({ textDecoration: "none" })}
                    >
                      <Button variant="accent" size="M">
                        Set password
                      </Button>
                    </Link>
                  ) : (
                    <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[14px]", padding: "12px 24px" })}>
                      Check your email for the link.
                    </Text>
                  )}
                  <Button
                    variant="secondary"
                    size="M"
                    onClick={handleResendEmail}
                    isPending={isResendingEmail}
                    isDisabled={isResendingEmail}
                  >
                    Resend email
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Heading
                  level={3}
                  styles={style({
                    fontSize: "[20px]",
                    fontWeight: "bold",
                    color: "white",
                  })}
                >
                  Continue to your vault
                </Heading>
                <Text styles={style({ color: "[rgba(255, 255, 255, 0.7)]", marginBottom: 16 })}>
                  Your order has been saved to your vault.
                </Text>
                <Link to="/account" style={style({ textDecoration: "none" })}>
                  <Button variant="accent" size="M">
                    Go to account
                  </Button>
                </Link>
              </>
            )}
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
          <button
            onClick={() => navigate("/shop")}
            className="ui-button ui-button--accent ui-button--l"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate("/")}
            className="ui-button ui-button--secondary ui-button--l"
          >
            Back to Home
          </button>
        </div>
      </main>
      <Footer />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default OrderSuccess;
