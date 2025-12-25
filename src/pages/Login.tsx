import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { PageHero } from "../components/PageHero";
import { Text, Button, TextField } from "../components/ui";
import { style } from "../utils/styles";
import { loginUser, registerUser } from "../utils/userAuth";
import { primarycolor } from "../styles/primaryColor";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get redirect path from location state (e.g., after checkout)
  const redirectTo = (location.state as { redirectTo?: string })?.redirectTo || "/account";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await loginUser(email, password);
      } else {
        if (!fullName.trim()) {
          setError("Full name is required");
          setIsLoading(false);
          return;
        }
        result = await registerUser(email, password, fullName);
      }

      if (result.success && result.user) {
        // Redirect to account page or back to checkout
        navigate(redirectTo, { replace: true });
      } else {
        setError(result.error || "Authentication failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
          maxWidth: "[500px]",
          marginX: "auto",
          width: "100%",
        })}
      >
        <PageHero
          title={isLogin ? "Login" : "Create Account"}
          subtitle={isLogin ? "Sign in to view your orders" : "Create an account to track your orders"}
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
          })}
        >
          {!isLogin && (
            <TextField
              label="Full Name"
              isRequired
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
            />
          )}

          <TextField
            label="Email"
            type="email"
            isRequired
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
          />

          <TextField
            label="Password"
            type="password"
            isRequired
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isLogin ? "Enter your password" : "At least 6 characters"}
          />

          {error && (
            <Text
              styles={style({
                color: "red",
                fontSize: "[14px]",
                padding: 12,
                backgroundColor: "[rgba(255, 0, 0, 0.1)]",
                borderRadius: "[4px]",
                border: "[1px solid rgba(255, 0, 0, 0.3)]",
              })}
            >
              {error}
            </Text>
          )}

          <Button
            type="submit"
            variant="accent"
            size="L"
            isPending={isLoading}
            isDisabled={isLoading}
            styles={style({
              width: "100%",
            })}
          >
            {isLogin ? "Login" : "Create Account"}
          </Button>

          <div style={style({ textAlign: "center", marginTop: 8 })}>
            <Text styles={style({ color: "[rgba(255, 255, 255, 0.7)]", fontSize: "[14px]" })}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: primarycolor,
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "14px",
                }}
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </Text>
          </div>
        </form>

        <Link to="/" style={style({ textDecoration: "none" })}>
          <Button variant="secondary" size="M">
            Back to Home
          </Button>
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default Login;

