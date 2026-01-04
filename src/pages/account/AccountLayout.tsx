import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { PageHero } from "../../components/PageHero";
import { Text, Button } from "../../components/ui";
import { style } from "../../utils/styles";
import { getCurrentUser, logout } from "../../utils/auth";
import { useState, useEffect } from "react";
import type { User } from "../../utils/auth";

export const AccountLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate("/login", { state: { redirectTo: "/account" } });
        return;
      }
      setUser(currentUser);
      setIsLoading(false);
    };
    loadUser();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  if (isLoading || !user) {
    return (
      <div style={style({ minHeight: "[100vh]", backgroundColor: "black", color: "white", display: "flex", flexDirection: "column" })}>
        <Header />
        <main style={style({ flex: 1, padding: "[64px 16px 80px]", display: "flex", alignItems: "center", justifyContent: "center" })}>
          <Text styles={style({ fontSize: "[16px]", color: "[rgba(255, 255, 255, 0.7)]" })}>
            Loading...
          </Text>
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
          maxWidth: "[1200px]",
          marginX: "auto",
          width: "100%",
        })}
      >
        <PageHero
          title="Your Vault"
          subtitle="Manage orders and delivery details in one place."
        />

        <div style={style({ display: "grid", gridTemplateColumns: "[200px 1fr]", gap: 32, alignItems: "start" })}>
          {/* Navigation */}
          <nav style={style({ display: "flex", flexDirection: "column", gap: 8 })}>
            <NavLink
              to="/account/orders"
              end
              style={({ isActive }) =>
                style({
                  padding: 12,
                  borderRadius: "[8px]",
                  textDecoration: "none",
                  color: isActive ? "white" : "[rgba(255, 255, 255, 0.7)]",
                  backgroundColor: isActive ? "[#141414]" : "transparent",
                  border: isActive ? "[1px solid #2E2E2E]" : "[1px solid transparent]",
                  fontSize: "[14px]",
                  fontWeight: isActive ? "600" : "400",
                  transition: "all 0.2s",
                })
              }
            >
              Orders
            </NavLink>
            <NavLink
              to="/account/addresses"
              style={({ isActive }) =>
                style({
                  padding: 12,
                  borderRadius: "[8px]",
                  textDecoration: "none",
                  color: isActive ? "white" : "[rgba(255, 255, 255, 0.7)]",
                  backgroundColor: isActive ? "[#141414]" : "transparent",
                  border: isActive ? "[1px solid #2E2E2E]" : "[1px solid transparent]",
                  fontSize: "[14px]",
                  fontWeight: isActive ? "600" : "400",
                  transition: "all 0.2s",
                })
              }
            >
              Addresses
            </NavLink>
            <NavLink
              to="/account/profile"
              style={({ isActive }) =>
                style({
                  padding: 12,
                  borderRadius: "[8px]",
                  textDecoration: "none",
                  color: isActive ? "white" : "[rgba(255, 255, 255, 0.7)]",
                  backgroundColor: isActive ? "[#141414]" : "transparent",
                  border: isActive ? "[1px solid #2E2E2E]" : "[1px solid transparent]",
                  fontSize: "[14px]",
                  fontWeight: isActive ? "600" : "400",
                  transition: "all 0.2s",
                })
              }
            >
              Profile
            </NavLink>
            <Button
              variant="secondary"
              size="M"
              onClick={handleLogout}
              styles={style({
                marginTop: 16,
                width: "100%",
              })}
            >
              Logout
            </Button>
          </nav>

          {/* Content */}
          <div style={style({ flex: 1 })}>
            <Outlet />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

