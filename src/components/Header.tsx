import { ActionButton, Text, Button } from "./ui";
import { ShoppingCart } from "./ui/icons";
import { primarycolor } from "../styles/primaryColor";
import { style } from "../utils/styles";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { isUserLoggedIn } from "../utils/userAuth";
import { isAuthenticated as isAdminAuthenticated, setAuthenticated } from "../utils/adminAuth";

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const shopDropdownRef = useRef<HTMLDivElement>(null);
  const [cartCount, setCartCount] = useState(() => Number(localStorage.getItem("cart-count") ?? "0"));
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAdminAuth = isAdminAuthenticated();

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setCartCount(detail);
    };
    window.addEventListener("cart-update", handler);
    
    return () => {
      window.removeEventListener("cart-update", handler);
    };
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsShopDropdownOpen(false);
  }, [location.pathname, location.search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shopDropdownRef.current && !shopDropdownRef.current.contains(event.target as Node)) {
        setIsShopDropdownOpen(false);
      }
    };

    if (isShopDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isShopDropdownOpen]);

  const handleLogout = () => {
    setAuthenticated(false);
    sessionStorage.removeItem("admin-session-active");
    navigate("/");
    setIsMenuOpen(false);
  };

  // Hamburger icon component
  const HamburgerIcon = ({ isOpen }: { isOpen: boolean }) => (
    <div style={{
      width: 24,
      height: 18,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      cursor: 'pointer',
    }}>
      <span style={{
        display: 'block',
        height: 2,
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        transform: isOpen ? 'rotate(45deg) translate(8px, 8px)' : 'none',
      }} />
      <span style={{
        display: 'block',
        height: 2,
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        opacity: isOpen ? 0 : 1,
      }} />
      <span style={{
        display: 'block',
        height: 2,
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        transform: isOpen ? 'rotate(-45deg) translate(8px, -8px)' : 'none',
      }} />
    </div>
  );
  const cartButtonStyles = {
    "--spectrum-actionbutton-background-color-default": "transparent",
    "--spectrum-actionbutton-background-color-hover": "transparent",
    "--spectrum-actionbutton-background-color-focus": "transparent",
    "--spectrum-actionbutton-background-color-active": "transparent",
    "--spectrum-actionbutton-content-color-default": "white",
    "--spectrum-actionbutton-content-color-hover": "white",
    "--spectrum-actionbutton-content-color-focus": "white",
    "--spectrum-actionbutton-padding": "4px 8px",
    "--spectrum-actionbutton-min-height": "auto",
    border: `1px solid ${primarycolor}`,
    borderRadius: "999px",
    padding: "2px",
    backgroundColor: cartCount === 0 ? "black" : primarycolor,
    color: "white",
    "--iconPrimary": "white",
  };
  
  return (
    <header
      className="main-header"
      style={{
        ...style({
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          backgroundClip: "padding-box",
          borderBottom: "none",
          boxShadow: "[inset 0 -1px 0 0 #2E2E2E]",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }),
        zIndex: 9999,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        width: "100%",
        minWidth: "100%",
        maxWidth: "100%",
        padding: "16px 16px",
        height: 80,
        backgroundColor: "rgba(20, 20, 20, 0.8)",
        transition: "background-color 0.3s ease",
        boxSizing: "border-box",
        overflow: "visible",
        margin: 0,
        marginLeft: 0,
        marginRight: 0,
        transform: "translateX(0)",
      }}
    >
      {/* Logo and brand */}
      <Link 
        to={isAdminRoute && isAdminAuth ? "/admin" : "/"} 
        style={style({ textDecoration: "none", color: "inherit" })}
        onClick={() => setIsMenuOpen(false)}
      >
        <div className="logo-container" style={style({ display: "flex", alignItems: "center", gap: 12, height: 30, flexShrink: 0, width: "auto", minWidth: "auto", paddingLeft: 24 })}>
          <Text
            className="logo-text"
            styles={style({
              fontFamily: "[\"Playfair Display\"]",
              fontSize: "[22px]",
              fontWeight: "[100]",
              color: "[rgba(255, 255, 255, 1)]",
              lineHeight: "[1.5]",
              whiteSpace: "nowrap",
            })}
          >
            Aether & Stones
          </Text>
          {isAdminRoute && isAdminAuth && (
            <Text
              styles={style({
                fontFamily: "[\"Adobe Clean\", \"Helvetica Neue\", \"Arial\", sans-serif]",
                fontSize: "[14px]",
                fontWeight: "[300]",
                color: "[rgba(255, 255, 255, 0.6)]",
                lineHeight: "[1.5]",
                letterSpacing: "[0.5px]",
              })}
            >
              | Admin
            </Text>
          )}
        </div>
      </Link>

      {/* Navigation */}
      {isAdminRoute && isAdminAuth ? (
        // Admin Navigation
        <nav className="desktop-nav" style={style({
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          overflowX: "auto",
        })}>
          <button
            onClick={() => navigate("/admin")}
            style={{
              padding: "8px 16px",
              backgroundColor: location.pathname === "/admin" && !location.search ? primarycolor : "transparent",
              color: location.pathname === "/admin" && !location.search ? "black" : "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: location.pathname === "/admin" && !location.search ? "600" : "400",
              transition: "all 0.2s",
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/admin?tab=inventory")}
            style={{
              padding: "8px 16px",
              backgroundColor: location.search.includes("tab=inventory") ? primarycolor : "transparent",
              color: location.search.includes("tab=inventory") ? "black" : "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: location.search.includes("tab=inventory") ? "600" : "400",
              transition: "all 0.2s",
            }}
          >
            Inventory
          </button>
          <button
            onClick={() => navigate("/admin?tab=orders")}
            style={{
              padding: "8px 16px",
              backgroundColor: location.search.includes("tab=orders") ? primarycolor : "transparent",
              color: location.search.includes("tab=orders") ? "black" : "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: location.search.includes("tab=orders") ? "600" : "400",
              transition: "all 0.2s",
            }}
          >
            Orders
          </button>
        </nav>
      ) : (
        // Regular Navigation
        <nav className="desktop-nav" style={style({
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          overflowX: "auto",
        })}>
          <Link 
            to="/" 
            style={style({ 
              textDecoration: 'none', 
              color: 'white',
              display: 'inline-block'
            })}
          >
            <ActionButton 
              isQuiet 
              styles={style({ 
                color: location.pathname === "/" ? primarycolor : 'white' 
              })}
            >
              Home
            </ActionButton>
          </Link>
          <div ref={shopDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
            <Link 
              to="/shop" 
              style={style({ 
                textDecoration: 'none', 
                color: 'white',
                display: 'inline-block'
              })}
              onMouseEnter={() => setIsShopDropdownOpen(true)}
            >
              <ActionButton 
                isQuiet 
                styles={style({ 
                  color: location.pathname === "/shop" ? primarycolor : 'white' 
                })}
              >
                Shop
              </ActionButton>
            </Link>
            {isShopDropdownOpen && (
              <div 
                style={style({
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 8,
                  backgroundColor: 'rgba(20, 20, 20, 0.98)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid #2E2E2E',
                  borderRadius: '8px',
                  padding: '8px 0',
                  minWidth: '160px',
                  zIndex: 10000,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                })}
                onMouseLeave={() => setIsShopDropdownOpen(false)}
              >
                <Link 
                  to="/shop" 
                  onClick={() => setIsShopDropdownOpen(false)}
                  style={style({ 
                    textDecoration: 'none', 
                    color: 'white',
                    display: 'block',
                    padding: '12px 16px',
                    transition: 'background-color 0.2s',
                  })}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(203, 109, 71, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Text styles={style({ color: 'white', fontSize: '[14px]' })}>
                    All Products
                  </Text>
                </Link>
                <Link 
                  to="/shop?category=forHer" 
                  onClick={() => setIsShopDropdownOpen(false)}
                  style={style({ 
                    textDecoration: 'none', 
                    color: 'white',
                    display: 'block',
                    padding: '12px 16px',
                    transition: 'background-color 0.2s',
                  })}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(203, 109, 71, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Text styles={style({ color: 'white', fontSize: '[14px]' })}>
                    For Her
                  </Text>
                </Link>
                <Link 
                  to="/shop?category=forHim" 
                  onClick={() => setIsShopDropdownOpen(false)}
                  style={style({ 
                    textDecoration: 'none', 
                    color: 'white',
                    display: 'block',
                    padding: '12px 16px',
                    transition: 'background-color 0.2s',
                  })}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(203, 109, 71, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Text styles={style({ color: 'white', fontSize: '[14px]' })}>
                    For Him
                  </Text>
                </Link>
              </div>
            )}
          </div>
          <Link 
            to="/shop?category=forHer" 
            style={style({ 
              textDecoration: 'none', 
              color: 'white',
              display: 'inline-block'
            })}
          >
            <ActionButton 
              isQuiet 
              styles={style({ 
                color: location.search.includes("category=forHer") ? primarycolor : 'white' 
              })}
            >
              For Her
            </ActionButton>
          </Link>
          <Link 
            to="/shop?category=forHim" 
            style={style({ 
              textDecoration: 'none', 
              color: 'white',
              display: 'inline-block'
            })}
          >
            <ActionButton 
              isQuiet 
              styles={style({ 
                color: location.search.includes("category=forHim") ? primarycolor : 'white' 
              })}
            >
              For Him
            </ActionButton>
          </Link>
          <Link 
            to="/energy" 
            style={style({ 
              textDecoration: 'none', 
              color: 'white',
              display: 'inline-block'
            })}
          >
            <ActionButton 
              isQuiet 
              styles={style({ 
                color: location.pathname === "/energy" ? primarycolor : 'white' 
              })}
            >
              Energy Guide
            </ActionButton>
          </Link>
        <Link 
          to="/about" 
          style={style({ 
            textDecoration: 'none', 
            color: 'white',
            display: 'inline-block'
          })}
        >
          <ActionButton 
            isQuiet 
            styles={style({ 
              color: location.pathname === "/about" ? primarycolor : 'white' 
            })}
          >
            About
          </ActionButton>
        </Link>
        {isUserLoggedIn() && (
          <Link 
            to="/account" 
            style={style({ 
              textDecoration: 'none', 
              color: 'white',
              display: 'inline-block'
            })}
          >
            <ActionButton 
              isQuiet 
              styles={style({ 
                color: location.pathname === "/account" ? primarycolor : 'white' 
              })}
            >
              My Account
            </ActionButton>
          </Link>
        )}
      </nav>
      )}

      {/* Cart/Logout and Hamburger Menu */}
      <div className="header-right-container" style={style({ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, minWidth: 0, flexDirection: "row", paddingRight: 0 })}>
        {isAdminRoute && isAdminAuth ? (
          // Logout Button for Admin
          <Button
            variant="secondary"
            onClick={handleLogout}
            styles={style({
              padding: "8px 16px",
              borderColor: primarycolor,
              borderWidth: "1px",
              borderStyle: "solid",
              color: primarycolor,
            })}
          >
            Logout
          </Button>
        ) : (
          // Regular Cart Button
          <Link to="/cart" style={style({ textDecoration: "none", color: "inherit", marginRight: 16 })}>
            <div style={cartButtonStyles} className="cart-button-wrapper">
              <ActionButton aria-label="Shopping cart" isQuiet>
                <span style={style({ marginRight: 8 })}>Cart</span>
                <ShoppingCart />
                {cartCount > 0 && <span className="header-cart-badge">{cartCount}</span>}
              </ActionButton>
            </div>
          </Link>
        )}
        
        {/* Hamburger button - visible on mobile */}
        <button
          className="hamburger-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: 'none', // Hidden by default, shown via CSS on mobile
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            marginLeft: 8,
          }}
          aria-label="Toggle menu"
        >
          <HamburgerIcon isOpen={isMenuOpen} />
        </button>
      </div>

      {/* Mobile Menu Drawer - slides down from top */}
      <div
        className={`mobile-menu ${isMenuOpen ? 'mobile-menu-open' : ''}`}
        style={{
          position: 'fixed',
          top: 80,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(20, 20, 20, 0.98)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          zIndex: 9998,
          flexDirection: 'column',
          padding: '32px 16px',
          overflowY: 'auto',
          maxHeight: isMenuOpen ? 'calc(100vh - 80px)' : '0',
          transition: 'max-height 0.3s ease-in-out, padding 0.3s ease-in-out',
          borderBottom: isMenuOpen ? '1px solid #2E2E2E' : 'none',
          boxShadow: isMenuOpen ? '0 4px 20px rgba(0, 0, 0, 0.3)' : 'none',
        }}
      >
        {isAdminRoute && isAdminAuth ? (
          <div style={style({ display: "flex", flexDirection: "column", gap: 16 })}>
            <button
              onClick={() => {
                navigate("/admin");
                setIsMenuOpen(false);
              }}
              style={{
                padding: "16px",
                backgroundColor: location.pathname === "/admin" && !location.search ? primarycolor : "transparent",
                color: location.pathname === "/admin" && !location.search ? "black" : "white",
                border: `1px solid ${location.pathname === "/admin" && !location.search ? primarycolor : "#2E2E2E"}`,
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: location.pathname === "/admin" && !location.search ? "600" : "400",
                textAlign: "left",
                fontSize: "16px",
                transition: "all 0.2s",
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                navigate("/admin?tab=inventory");
                setIsMenuOpen(false);
              }}
              style={{
                padding: "16px",
                backgroundColor: location.search.includes("tab=inventory") ? primarycolor : "transparent",
                color: location.search.includes("tab=inventory") ? "black" : "white",
                border: `1px solid ${location.search.includes("tab=inventory") ? primarycolor : "#2E2E2E"}`,
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: location.search.includes("tab=inventory") ? "600" : "400",
                textAlign: "left",
                fontSize: "16px",
                transition: "all 0.2s",
              }}
            >
              Inventory
            </button>
            <button
              onClick={() => {
                navigate("/admin?tab=orders");
                setIsMenuOpen(false);
              }}
              style={{
                padding: "16px",
                backgroundColor: location.search.includes("tab=orders") ? primarycolor : "transparent",
                color: location.search.includes("tab=orders") ? "black" : "white",
                border: `1px solid ${location.search.includes("tab=orders") ? primarycolor : "#2E2E2E"}`,
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: location.search.includes("tab=orders") ? "600" : "400",
                textAlign: "left",
                fontSize: "16px",
                transition: "all 0.2s",
              }}
            >
              Orders
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: "16px",
                backgroundColor: "transparent",
                color: primarycolor,
                border: `1px solid ${primarycolor}`,
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "400",
                textAlign: "left",
                fontSize: "16px",
                marginTop: 16,
                transition: "all 0.2s",
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={style({ display: "flex", flexDirection: "column", gap: 16 })}>
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              style={style({
                textDecoration: 'none',
                color: 'white',
                padding: "16px",
                border: "1px solid #2E2E2E",
                borderRadius: "8px",
                textAlign: "left",
                fontSize: "16px",
                transition: "all 0.2s",
              })}
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setIsMenuOpen(false)}
              style={style({
                textDecoration: 'none',
                color: 'white',
                padding: "16px",
                border: "1px solid #2E2E2E",
                borderRadius: "8px",
                textAlign: "left",
                fontSize: "16px",
                transition: "all 0.2s",
              })}
            >
              All Products
            </Link>
            <Link
              to="/shop?category=forHer"
              onClick={() => setIsMenuOpen(false)}
              style={style({
                textDecoration: 'none',
                color: 'white',
                padding: "16px",
                border: "1px solid #2E2E2E",
                borderRadius: "8px",
                textAlign: "left",
                fontSize: "16px",
                transition: "all 0.2s",
              })}
            >
              For Her
            </Link>
            <Link
              to="/shop?category=forHim"
              onClick={() => setIsMenuOpen(false)}
              style={style({
                textDecoration: 'none',
                color: 'white',
                padding: "16px",
                border: "1px solid #2E2E2E",
                borderRadius: "8px",
                textAlign: "left",
                fontSize: "16px",
                transition: "all 0.2s",
              })}
            >
              For Him
            </Link>
            <Link
              to="/energy"
              onClick={() => setIsMenuOpen(false)}
              style={style({
                textDecoration: 'none',
                color: 'white',
                padding: "16px",
                border: "1px solid #2E2E2E",
                borderRadius: "8px",
                textAlign: "left",
                fontSize: "16px",
                transition: "all 0.2s",
              })}
            >
              Energy Guide
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMenuOpen(false)}
              style={style({
                textDecoration: 'none',
                color: 'white',
                padding: "16px",
                border: "1px solid #2E2E2E",
                borderRadius: "8px",
                textAlign: "left",
                fontSize: "16px",
                transition: "all 0.2s",
              })}
            >
              About
            </Link>
            {isUserLoggedIn() && (
              <Link
                to="/account"
                onClick={() => setIsMenuOpen(false)}
                style={style({
                  textDecoration: 'none',
                  color: 'white',
                  padding: "16px",
                  border: "1px solid #2E2E2E",
                  borderRadius: "8px",
                  textAlign: "left",
                  fontSize: "16px",
                  transition: "all 0.2s",
                })}
              >
                My Account
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
