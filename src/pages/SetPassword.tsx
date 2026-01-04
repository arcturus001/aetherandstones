import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { PageHero } from "../components/PageHero";
import { Text, Button, TextField } from "../components/ui";
import { style } from "../utils/styles";
// getCurrentUser not needed here - session is created via login API

type ErrorType = "invalid_token" | "expired_token" | "password_weak" | "password_mismatch" | "network" | "unknown";

const SetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [maskedEmail, setMaskedEmail] = useState<string>("");
  const [actualEmail, setActualEmail] = useState<string>(""); // Store actual email for API call
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<{ type: ErrorType; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  // Validate token and fetch masked email on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError({ type: "invalid_token", message: "Invalid link. Please check your email." });
        setIsValidating(false);
        return;
      }

      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
        const response = await fetch(`${API_BASE_URL}/users?action=validate-token&token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (!response.ok) {
          if (data.error?.includes('expired')) {
            setError({ type: "expired_token", message: "This link has expired. Please request a new password setup link." });
          } else if (data.error?.includes('used')) {
            setError({ type: "invalid_token", message: "This link has already been used. Please request a new password setup link." });
          } else {
            setError({ type: "invalid_token", message: "Invalid or expired link. Please check your email." });
          }
          setIsValidating(false);
          return;
        }

        setMaskedEmail(data.maskedEmail || "");
        setActualEmail(data.email || ""); // Store actual email for API call
        setIsValidating(false);
      } catch (err) {
        setError({ type: "network", message: "Network error. Please check your connection and try again." });
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const validatePassword = (pwd: string): { valid: boolean; error?: string } => {
    if (pwd.length < 6) {
      return { valid: false, error: "Password must be at least 6 characters" };
    }
    if (pwd.length > 128) {
      return { valid: false, error: "Password is too long" };
    }
    return { valid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!password || !confirmPassword) {
      setError({ type: "unknown", message: "Please fill in all fields" });
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError({ type: "password_weak", message: passwordValidation.error || "Password is too weak" });
      return;
    }

    if (password !== confirmPassword) {
      setError({ type: "password_mismatch", message: "Passwords do not match" });
      return;
    }

    if (!token) {
      setError({ type: "invalid_token", message: "Invalid link. Please check your email." });
      return;
    }

    setIsLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${API_BASE_URL}/users?action=set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token, 
          email: actualEmail, // Use actual email from token validation
          password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError({ type: "network", message: "Too many attempts. Please try again later." });
        } else if (data.error?.includes('expired') || data.error?.includes('Invalid')) {
          setError({ type: "expired_token", message: "This link has expired or is invalid. Please request a new password setup link." });
        } else {
          setError({ type: "unknown", message: data.error || "Failed to set password. Please try again." });
        }
        return;
      }

      // After password is set, create a session by logging in
      // This ensures the user is authenticated with a session cookie
      try {
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Required for cookies
          body: JSON.stringify({
            email: actualEmail,
            password: password,
          }),
        });

        if (loginResponse.ok) {
          // Session cookie is now set, redirect to account
          navigate("/account", { replace: true });
        } else {
          // Password set but login failed - redirect to login page
          navigate("/login", { 
            replace: true,
            state: { message: "Password set successfully. Please log in." }
          });
        }
      } catch (loginError) {
        // Password set but login failed - redirect to login page
        console.error("Auto-login after password setup failed:", loginError);
        navigate("/login", { 
          replace: true,
          state: { message: "Password set successfully. Please log in." }
        });
      }
    } catch (err) {
      setError({ type: "network", message: "Network error. Please check your connection and try again." });
      console.error("Set password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while validating token
  if (isValidating) {
    return (
      <div style={style({ minHeight: "[100vh]", backgroundColor: "black", color: "white", display: "flex", flexDirection: "column" })}>
        <Header />
        <main style={style({ flex: 1, padding: "[64px 16px 80px]", display: "flex", alignItems: "center", justifyContent: "center" })}>
          <div style={style({ textAlign: "center" })}>
            <Text styles={style({ fontSize: "[16px]", color: "[rgba(255, 255, 255, 0.7)]" })}>
              Validating link...
            </Text>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state (invalid/expired token)
  if (error && (error.type === "invalid_token" || error.type === "expired_token")) {
    return (
      <div style={style({ minHeight: "[100vh]", backgroundColor: "black", color: "white", display: "flex", flexDirection: "column" })}>
        <Header />
        <main style={style({ flex: 1, padding: "[64px 16px 80px]", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", maxWidth: "[600px]", marginX: "auto", width: "100%" })}>
          <PageHero 
            title={error.type === "expired_token" ? "Link Expired" : "Invalid Link"} 
            subtitle={error.message}
          />
          <div style={style({ marginTop: 32, textAlign: "center" })}>
            <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[14px]" })}>
              Please check your email for a new password setup link, or contact support if you continue to experience issues.
            </Text>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={style({ minHeight: "[100vh]", backgroundColor: "black", color: "white", display: "flex", flexDirection: "column" })}>
      <Header />
      <main style={style({ flex: 1, padding: "[64px 16px 80px]", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", maxWidth: "[500px]", marginX: "auto", width: "100%" })}>
        <PageHero 
          title="Secure your vault" 
          subtitle="Set a password to access orders, shipping details, and faster checkout." 
        />

        <form 
          onSubmit={handleSubmit} 
          style={style({ 
            width: "100%",
            display: "flex", 
            flexDirection: "column", 
            gap: 24,
            padding: 32,
            backgroundColor: "[#141414]",
            border: "[1px solid #2E2E2E]",
            borderRadius: "[8px]",
            marginTop: 32,
          })}
        >
          {maskedEmail && (
            <div style={style({ marginBottom: 8 })}>
              <Text styles={style({ fontSize: "[14px]", color: "[rgba(255, 255, 255, 0.6)]", marginBottom: 8 })}>
                Account
              </Text>
              <Text styles={style({ fontSize: "[16px]", color: "white", fontWeight: "500" })}>
                {maskedEmail}
              </Text>
            </div>
          )}

          <TextField
            label="Password"
            type="password"
            isRequired
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null); // Clear error on input
            }}
            placeholder="At least 6 characters"
            errorMessage={error?.type === "password_weak" ? error.message : undefined}
            styles={style({ width: "100%" })}
          />

          <TextField
            label="Confirm Password"
            type="password"
            isRequired
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError(null); // Clear error on input
            }}
            placeholder="Re-enter your password"
            errorMessage={error?.type === "password_mismatch" ? error.message : undefined}
            styles={style({ width: "100%" })}
          />

          {error && error.type !== "password_weak" && error.type !== "password_mismatch" && (
            <div style={style({ 
              padding: 16, 
              backgroundColor: "[rgba(203, 109, 71, 0.1)]", 
              border: "[1px solid rgba(203, 109, 71, 0.3)]",
              borderRadius: "[8px]",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            })}>
              <Text styles={style({ fontSize: "[20px]", lineHeight: "[1]" })}>⚠️</Text>
              <Text styles={style({ color: "[rgba(255, 255, 255, 0.9)]", fontSize: "[14px]", flex: 1, lineHeight: "[1.5]" })}>
                {error.message}
              </Text>
            </div>
          )}

          <Button
            type="submit"
            variant="accent"
            size="L"
            isPending={isLoading}
            isDisabled={isLoading || !password || !confirmPassword}
            styles={style({ width: "100%", marginTop: 8 })}
          >
            {isLoading ? "Setting Password..." : "Set Password"}
          </Button>

          <Text styles={style({ fontSize: "[12px]", color: "[rgba(255, 255, 255, 0.5)]", textAlign: "center", marginTop: 8 })}>
            By setting your password, you agree to our terms of service.
          </Text>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default SetPassword;

