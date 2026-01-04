import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "../components/Header";
import { Text, Heading, Button, TextField, TextArea, Badge, ActionButton } from "../components/ui";
import { style } from "../utils/styles";
import { products as initialProducts, type Product } from "../data/products";
import { primarycolor } from "../styles/primaryColor";
import { verifyCredentials, isAuthenticated, setAuthenticated } from "../utils/adminAuth";
import { mockSalesData, mockInventory, mockRecentOrders, mockTopProducts, type RecentOrder, type InventoryItem } from "../utils/mockData";
import { initializeOrders, updateOrderStatus, getOrders } from "../utils/orders";
import { getInventory, initializeInventory } from "../utils/inventory";

// Extended Product interface for admin
interface ExtendedProduct extends Product {
  whyWeMadeIt?: string;
  salePercentage?: number;
  isNew?: boolean;
  enabled?: boolean;
  hoverImage?: string;
  additionalImages?: string[];
}

// Available energy properties
const ENERGY_PROPERTIES = [
  "Protection",
  "Clarity",
  "Spirituality",
  "Confidence",
  "Willpower",
  "Love",
  "Compassion",
  "Heart Healing",
  "Amplification",
  "Energy",
  "Wisdom",
  "Truth",
  "Communication",
];

const Admin = () => {
  const [searchParams] = useSearchParams();
  
  // Clear authentication on mount to force login on direct access
  const [isAuth, setIsAuth] = useState(() => {
    // Check if this is a fresh page load (direct access)
    const isDirectAccess = !sessionStorage.getItem("admin-session-active");
    
    if (isDirectAccess) {
      // Clear authentication cache on direct access
      setAuthenticated(false);
      sessionStorage.removeItem("admin-session-active");
      return false;
    }
    
    return isAuthenticated();
  });
  
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const tabParam = searchParams.get("tab") as "dashboard" | "inventory" | "orders" | null;
  const [activeTab, setActiveTab] = useState<"dashboard" | "inventory" | "orders">(tabParam || "dashboard");
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [orderFilter, setOrderFilter] = useState<"all" | "gathering" | "shipped" | "delivered">("all");
  const [inventoryView, setInventoryView] = useState<"list" | "grid">("list");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Sync activeTab with URL params
  useEffect(() => {
    const tab = searchParams.get("tab") as "dashboard" | "inventory" | "orders" | null;
    if (tab && ["dashboard", "inventory", "orders"].includes(tab)) {
      setActiveTab(tab);
    } else if (!tab) {
      setActiveTab("dashboard");
    }
  }, [searchParams]);

  const [products, setProducts] = useState<ExtendedProduct[]>(() => {
    const stored = localStorage.getItem("admin-products");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure all products have forHer/forHim properties
      return parsed.map((p: ExtendedProduct) => ({
        ...p,
        enabled: p.enabled ?? true,
        isNew: p.isNew ?? false,
        forHer: p.forHer ?? false,
        forHim: p.forHim ?? false,
      }));
    }
    return initialProducts.map(p => ({ 
      ...p, 
      enabled: true, 
      isNew: false,
      forHer: p.forHer ?? false,
      forHim: p.forHim ?? false,
    }));
  });
  const [editingProduct, setEditingProduct] = useState<ExtendedProduct | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<ExtendedProduct>>({
    name: "",
    description: "",
    price: 0,
    originalPrice: undefined,
    stone: "",
    properties: [],
    featured: false,
    inStock: true,
    whyWeMadeIt: "",
    salePercentage: undefined,
    isNew: false,
    enabled: true,
    image: "",
    hoverImage: "",
    additionalImages: [],
    forHer: false,
    forHim: false,
  });

  useEffect(() => {
    localStorage.setItem("admin-products", JSON.stringify(products));
    // Dispatch custom event to notify shop page of updates
    window.dispatchEvent(new Event('admin-products-updated'));
  }, [products]);

  // Initialize orders
  useEffect(() => {
    const loadOrders = async () => {
      const initializedOrders = await initializeOrders(mockRecentOrders);
      const apiOrders = await getOrders();
      // Use API orders if available, otherwise use initialized orders
      setOrders(apiOrders.length > 0 ? apiOrders : initializedOrders);
    };
    loadOrders();

    // Listen for order updates
    const handleOrderUpdate = async () => {
      const updatedOrders = await getOrders();
      setOrders(updatedOrders);
    };

    window.addEventListener('order-status-updated', handleOrderUpdate);
    window.addEventListener('new-order-created', handleOrderUpdate);

    return () => {
      window.removeEventListener('order-status-updated', handleOrderUpdate);
      window.removeEventListener('new-order-created', handleOrderUpdate);
    };
  }, []);

  // Initialize inventory
  useEffect(() => {
    const loadInventory = async () => {
      const initializedInventory = await initializeInventory(mockInventory);
      const apiInventory = await getInventory();
      // Use API inventory if available, otherwise use initialized inventory
      setInventory(apiInventory.length > 0 ? apiInventory : initializedInventory);
    };
    loadInventory();

    // Listen for inventory updates
    const handleInventoryUpdate = async () => {
      const updatedInventory = await getInventory();
      setInventory(updatedInventory);
    };

    const handleInventoryDelete = async () => {
      const updatedInventory = await getInventory();
      setInventory(updatedInventory);
    };

    window.addEventListener('inventory-updated', handleInventoryUpdate);
    window.addEventListener('inventory-deleted', handleInventoryDelete);

    return () => {
      window.removeEventListener('inventory-updated', handleInventoryUpdate);
      window.removeEventListener('inventory-deleted', handleInventoryDelete);
    };
  }, []);

  const handleInputChange = (field: string, value: string | number | boolean | string[] | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePropertyToggle = (property: string) => {
    const current = formData.properties || [];
    const updated = current.includes(property)
      ? current.filter(p => p !== property)
      : [...current, property];
    handleInputChange("properties", updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange("image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange("hoverImage", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const readers = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(readers).then((results) => {
        const currentImages = formData.additionalImages || [];
        handleInputChange("additionalImages", [...currentImages, ...results]);
      });
    }
  };

  const handleRemoveAdditionalImage = (index: number) => {
    const currentImages = formData.additionalImages || [];
    handleInputChange("additionalImages", currentImages.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!formData.name || !formData.price || !formData.stone) {
      alert("Please fill in required fields: Name, Price, and Stone");
      return;
    }

    if (editingProduct) {
      // Update existing product - ensure forHer/forHim are explicitly set AFTER spread
      const { forHer, forHim, ...restFormData } = formData;
      const updatedProduct: ExtendedProduct = {
        ...editingProduct,
        ...restFormData,
        id: editingProduct.id,
        name: formData.name || editingProduct.name,
        price: formData.price ?? editingProduct.price,
        stone: formData.stone || editingProduct.stone,
        forHer: forHer === true, // Explicitly set boolean AFTER spread
        forHim: forHim === true, // Explicitly set boolean AFTER spread
      };
      
      setProducts(prev =>
        prev.map(p =>
          p.id === editingProduct.id ? updatedProduct : p
        )
      );
      setEditingProduct(null);
    } else {
      // Add new product
      const newProduct: ExtendedProduct = {
        id: Date.now().toString(),
        name: formData.name!,
        description: formData.description || "",
        price: formData.price!,
        originalPrice: formData.originalPrice,
        stone: formData.stone!,
        properties: formData.properties || [],
        featured: formData.featured || false,
        inStock: formData.inStock ?? true,
        image: formData.image || "",
        hoverImage: formData.hoverImage,
        additionalImages: formData.additionalImages || [],
        whyWeMadeIt: formData.whyWeMadeIt,
        salePercentage: formData.salePercentage,
        isNew: formData.isNew || false,
        enabled: formData.enabled ?? true,
        forHer: formData.forHer === true, // Explicitly set boolean
        forHim: formData.forHim === true, // Explicitly set boolean
      };
      setProducts(prev => [...prev, newProduct]);
      setShowAddForm(false);
    }

    // Reset form
    setFormData({
      name: "",
      description: "",
      price: 0,
      originalPrice: undefined,
      stone: "",
      properties: [],
      featured: false,
      inStock: true,
      whyWeMadeIt: "",
      salePercentage: undefined,
      isNew: false,
      enabled: true,
      image: "",
      hoverImage: "",
      additionalImages: [],
      forHer: false,
      forHim: false,
    });
  };

  const handleEdit = (product: ExtendedProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      stone: product.stone,
      properties: product.properties,
      featured: product.featured,
      inStock: product.inStock,
      image: product.image,
      hoverImage: product.hoverImage || "",
      additionalImages: product.additionalImages || [],
      whyWeMadeIt: product.whyWeMadeIt || "",
      salePercentage: product.salePercentage,
      isNew: product.isNew || false,
      enabled: product.enabled ?? true,
      forHer: product.forHer || false,
      forHim: product.forHim || false,
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleToggleEnabled = (id: string) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, enabled: !p.enabled } : p
      )
    );
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setShowAddForm(false);
    setFormData({
      name: "",
      description: "",
      price: 0,
      originalPrice: undefined,
      stone: "",
      properties: [],
      featured: false,
      inStock: true,
      whyWeMadeIt: "",
      salePercentage: undefined,
      isNew: false,
      enabled: true,
      image: "",
      hoverImage: "",
      additionalImages: [],
      forHer: false,
      forHim: false,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const isValid = await verifyCredentials(loginData.username, loginData.password);
      if (isValid) {
        setIsAuth(true);
        setAuthenticated(true);
        // Set session flag to indicate active session (not direct access)
        sessionStorage.setItem("admin-session-active", "true");
        setLoginError("");
        setLoginData({ username: "", password: "" });
      } else {
        setLoginError("Invalid username or password");
        setLoginData({ username: "", password: "" });
      }
    } catch (error) {
      setLoginError("Authentication error. Please try again.");
      console.error("Login error:", error);
    }
  };


  const handleOrderStatusChange = async (orderId: string, newStatus: RecentOrder['status']) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      // Refresh orders from API
      const updatedOrders = await getOrders();
      setOrders(updatedOrders);
    } else {
      alert('Failed to update order status. Please try again.');
    }
  };

  // Show login form if not authenticated
  if (!isAuth) {
    return (
      <div
        style={style({
          minHeight: "[100vh]",
          backgroundColor: "black",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        })}
      >
        <div
          style={style({
            backgroundColor: "[#141414]",
            border: "[1px solid #2E2E2E]",
            borderRadius: "[8px]",
            padding: 48,
            maxWidth: 400,
            width: "100%",
          })}
        >
          <Heading level={1} styles={style({ color: "white", marginBottom: 32, textAlign: "center" })}>
            Admin Login
          </Heading>
          <form onSubmit={handleLogin} style={style({ display: "flex", flexDirection: "column", gap: 20 })}>
            <TextField
              label="Username"
              isRequired
              value={loginData.username}
              onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Enter username"
              autoComplete="username"
            />
            <TextField
              label="Password"
              type="password"
              isRequired
              value={loginData.password}
              onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter password"
              autoComplete="current-password"
            />
            {loginError && (
              <Text styles={style({ color: "red", fontSize: "[0.875rem]" })}>
                {loginError}
              </Text>
            )}
            <Button type="submit" variant="primary" size="L">
              Login
            </Button>
          </form>
        </div>
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
        <div style={style({ maxWidth: "[1200px]", marginX: "auto", width: "100%", paddingTop: "[80px]" })}>
          <div style={style({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 })}>
            <Heading level={1} styles={style({ color: "white" })}>
              Admin Dashboard
            </Heading>
          </div>


          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div style={style({ display: "flex", flexDirection: "column", gap: 32 })}>
              {/* Sales Metrics Cards */}
              <div style={style({ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 })}>
                <div style={style({ backgroundColor: "[#141414]", border: "[1px solid #2E2E2E]", borderRadius: "[8px]", padding: 24 })}>
                  <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[0.875rem]", marginBottom: 8 })}>
                    Total Revenue
                  </Text>
                  <Heading level={2} styles={style({ color: "white", fontSize: "[32px]", fontWeight: "bold", margin: 0 })}>
                    ${mockSalesData.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Heading>
                  <Text styles={style({ color: "[rgba(34, 197, 94, 1)]", fontSize: "[0.875rem]", marginTop: 8 })}>
                    ↑ {((mockSalesData.revenueThisMonth / mockSalesData.revenueLastMonth - 1) * 100).toFixed(1)}% vs last month
                  </Text>
                </div>

                <div style={style({ backgroundColor: "[#141414]", border: "[1px solid #2E2E2E]", borderRadius: "[8px]", padding: 24 })}>
                  <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[0.875rem]", marginBottom: 8 })}>
                    Total Orders
                  </Text>
                  <Heading level={2} styles={style({ color: "white", fontSize: "[32px]", fontWeight: "bold", margin: 0 })}>
                    {mockSalesData.totalOrders}
                  </Heading>
                  <Text styles={style({ color: "[rgba(34, 197, 94, 1)]", fontSize: "[0.875rem]", marginTop: 8 })}>
                    ↑ {((mockSalesData.ordersThisMonth / mockSalesData.ordersLastMonth - 1) * 100).toFixed(1)}% vs last month
                  </Text>
                </div>

                <div style={style({ backgroundColor: "[#141414]", border: "[1px solid #2E2E2E]", borderRadius: "[8px]", padding: 24 })}>
                  <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[0.875rem]", marginBottom: 8 })}>
                    Average Order Value
                  </Text>
                  <Heading level={2} styles={style({ color: "white", fontSize: "[32px]", fontWeight: "bold", margin: 0 })}>
                    ${mockSalesData.averageOrderValue.toFixed(2)}
                  </Heading>
                  <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[0.875rem]", marginTop: 8 })}>
                    This month: ${(mockSalesData.revenueThisMonth / mockSalesData.ordersThisMonth).toFixed(2)}
                  </Text>
                </div>

                <div style={style({ backgroundColor: "[#141414]", border: "[1px solid #2E2E2E]", borderRadius: "[8px]", padding: 24 })}>
                  <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[0.875rem]", marginBottom: 8 })}>
                    This Month Revenue
                  </Text>
                  <Heading level={2} styles={style({ color: "white", fontSize: "[32px]", fontWeight: "bold", margin: 0 })}>
                    ${mockSalesData.revenueThisMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Heading>
                  <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[0.875rem]", marginTop: 8 })}>
                    {mockSalesData.ordersThisMonth} orders
                  </Text>
                </div>
              </div>

              {/* Inventory Status */}
              <div style={style({ backgroundColor: "[#141414]", border: "[1px solid #2E2E2E]", borderRadius: "[8px]", padding: 24 })}>
                <Heading level={2} styles={style({ color: "white", fontSize: "[24px]", fontWeight: "bold", marginBottom: 24 })}>
                  Inventory Status
                </Heading>
                <div style={style({ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 })}>
                  {inventory.map((item) => (
                    <div
                      key={item.productId}
                      style={style({
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: 16,
                        backgroundColor: "[#0a0a0a]",
                        borderRadius: "[8px]",
                        border: "[1px solid #2E2E2E]",
                      })}
                    >
                      <div style={style({ flex: 1 })}>
                        <Text styles={style({ color: "white", fontWeight: "600", marginBottom: 4 })}>
                          {item.productName}
                        </Text>
                        <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[0.875rem]" })}>
                          Stock: {item.stock} units
                        </Text>
                      </div>
                      <div style={style({ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 })}>
                        <Badge
                          variant={
                            item.status === "in-stock"
                              ? "positive"
                              : item.status === "low-stock"
                              ? "informative"
                              : "negative"
                          }
                        >
                          {item.status === "in-stock"
                            ? "In Stock"
                            : item.status === "low-stock"
                            ? "Low Stock"
                            : "Out of Stock"}
                        </Badge>
                        <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[0.875rem]" })}>
                          ${item.price}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders and Top Products */}
              <div style={style({ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24 })}>
                {/* Recent Orders */}
                <div style={style({ backgroundColor: "[#141414]", border: "[1px solid #2E2E2E]", borderRadius: "[8px]", padding: 24 })}>
                  <Heading level={2} styles={style({ color: "white", fontSize: "[24px]", fontWeight: "bold", marginBottom: 24 })}>
                    Recent Orders
                  </Heading>
                  <div style={style({ display: "flex", flexDirection: "column", gap: 12 })}>
                    {mockRecentOrders.map((order) => (
                      <div
                        key={order.id}
                        style={style({
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: 16,
                          backgroundColor: "[#0a0a0a]",
                          borderRadius: "[8px]",
                          border: "[1px solid #2E2E2E]",
                        })}
                      >
                        <div style={style({ flex: 1 })}>
                          <Text styles={style({ color: "white", fontWeight: "600", marginBottom: 4 })}>
                            {order.customerName}
                          </Text>
                          <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[0.875rem]" })}>
                            {order.productName} × {order.quantity}
                          </Text>
                          <Text styles={style({ color: "[rgba(255, 255, 255, 0.5)]", fontSize: "[0.75rem]", marginTop: 4 })}>
                            {order.date}
                          </Text>
                        </div>
                        <div style={style({ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 })}>
                          <Text styles={style({ color: "white", fontWeight: "600" })}>
                            ${order.total.toFixed(2)}
                          </Text>
                          <Badge
                            variant={
                              order.status === "delivered"
                                ? "positive"
                                : order.status === "shipped"
                                ? "informative"
                                : "neutral"
                            }
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Products */}
                <div style={style({ backgroundColor: "[#141414]", border: "[1px solid #2E2E2E]", borderRadius: "[8px]", padding: 24 })}>
                  <Heading level={2} styles={style({ color: "white", fontSize: "[24px]", fontWeight: "bold", marginBottom: 24 })}>
                    Top Selling Products
                  </Heading>
                  <div style={style({ display: "flex", flexDirection: "column", gap: 12 })}>
                    {mockTopProducts.map((product, index) => (
                      <div
                        key={product.productId}
                        style={style({
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: 16,
                          backgroundColor: "[#0a0a0a]",
                          borderRadius: "[8px]",
                          border: "[1px solid #2E2E2E]",
                        })}
                      >
                        <div style={style({ display: "flex", alignItems: "center", gap: 12 })}>
                          <div
                            style={style({
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              backgroundColor: primarycolor,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "black",
                              fontWeight: "bold",
                            })}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <Text styles={style({ color: "white", fontWeight: "600", marginBottom: 4 })}>
                              {product.productName}
                            </Text>
                            <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[0.875rem]" })}>
                              {product.sales} sales
                            </Text>
                          </div>
                        </div>
                        <Text styles={style({ color: primarycolor, fontWeight: "600", fontSize: "[18px]" })}>
                          ${product.revenue.toFixed(2)}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div>
              <div style={style({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 })}>
                <Heading level={2} styles={style({ color: "white" })}>
                  Inventory
                </Heading>
                {!showAddForm && (
                  <div style={style({ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 })}>
                    <Button
                      variant="primary"
                      onPress={() => {
                        setShowAddForm(true);
                        setEditingProduct(null);
                      }}
                    >
                      Add New Product
                    </Button>
                    <div style={style({ display: "flex", gap: 8 })}>
                      <button
                        onClick={() => setInventoryView("list")}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "6px",
                          border: inventoryView === "list" ? `2px solid ${primarycolor}` : "1px solid #2E2E2E",
                          backgroundColor: inventoryView === "list" ? `${primarycolor}20` : "transparent",
                          color: inventoryView === "list" ? primarycolor : "white",
                          cursor: "pointer",
                          fontWeight: inventoryView === "list" ? "600" : "400",
                          transition: "all 0.2s",
                        }}
                      >
                        List
                      </button>
                      <button
                        onClick={() => setInventoryView("grid")}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "6px",
                          border: inventoryView === "grid" ? `2px solid ${primarycolor}` : "1px solid #2E2E2E",
                          backgroundColor: inventoryView === "grid" ? `${primarycolor}20` : "transparent",
                          color: inventoryView === "grid" ? primarycolor : "white",
                          cursor: "pointer",
                          fontWeight: inventoryView === "grid" ? "600" : "400",
                          transition: "all 0.2s",
                        }}
                      >
                        Grid
                      </button>
                    </div>
                  </div>
                )}
              </div>

          {showAddForm && (
            <div
              style={style({
                backgroundColor: "[#141414]",
                border: "[1px solid #2E2E2E]",
                borderRadius: "[8px]",
                padding: 32,
                marginBottom: 48,
              })}
            >
              <Heading level={2} styles={style({ color: "white", marginBottom: 24 })}>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </Heading>

              <div style={style({ display: "flex", flexDirection: "column", gap: 20 })}>
                <div style={style({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 })}>
                  <TextField
                    label="Product Name *"
                    isRequired
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Amethyst Power Bracelet"
                  />
                  <TextField
                    label="Stone Type *"
                    isRequired
                    value={formData.stone || ""}
                    onChange={(e) => handleInputChange("stone", e.target.value)}
                    placeholder="Amethyst"
                  />
                </div>

                <TextArea
                  label="Description *"
                  isRequired
                  value={formData.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Support a sense of safety and grounding..."
                  rows={3}
                />

                <TextArea
                  label="Why We Made It"
                  value={formData.whyWeMadeIt || ""}
                  onChange={(e) => handleInputChange("whyWeMadeIt", e.target.value)}
                  placeholder="We made this bracelet because..."
                  rows={4}
                />

                <div style={style({ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 })}>
                  <TextField
                    label="Price *"
                    type="number"
                    isRequired
                    value={formData.price?.toString() || "0"}
                    onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                    placeholder="89"
                  />
                  <TextField
                    label="Original Price (optional)"
                    type="number"
                    value={formData.originalPrice?.toString() || ""}
                    onChange={(e) =>
                      handleInputChange("originalPrice", e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    placeholder="120"
                  />
                  <TextField
                    label="Sale Percentage (optional)"
                    type="number"
                    value={formData.salePercentage?.toString() || ""}
                    onChange={(e) =>
                      handleInputChange("salePercentage", e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    placeholder="26"
                  />
                </div>

                {/* Main Image */}
                <div>
                  <Text styles={style({ marginBottom: 12, fontWeight: "600" })}>Main Image *</Text>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{
                      padding: "8px",
                      border: "1px solid #2E2E2E",
                      borderRadius: "4px",
                      backgroundColor: "black",
                      color: "white",
                      width: "100%",
                    }}
                  />
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Main image preview"
                      style={{
                        marginTop: 12,
                        maxWidth: 200,
                        maxHeight: 200,
                        borderRadius: 8,
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>

                {/* Hover Image */}
                <div>
                  <Text styles={style({ marginBottom: 12, fontWeight: "600" })}>Hover Image (optional)</Text>
                  <Text styles={style({ marginBottom: 8, fontSize: "[0.875rem]", color: "[rgba(255, 255, 255, 0.6)]" })}>
                    Image shown when hovering over the product card
                  </Text>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHoverImageUpload}
                    style={{
                      padding: "8px",
                      border: "1px solid #2E2E2E",
                      borderRadius: "4px",
                      backgroundColor: "black",
                      color: "white",
                      width: "100%",
                    }}
                  />
                  {formData.hoverImage && (
                    <img
                      src={formData.hoverImage}
                      alt="Hover image preview"
                      style={{
                        marginTop: 12,
                        maxWidth: 200,
                        maxHeight: 200,
                        borderRadius: 8,
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>

                {/* Additional Images */}
                <div>
                  <Text styles={style({ marginBottom: 12, fontWeight: "600" })}>Additional Images (optional)</Text>
                  <Text styles={style({ marginBottom: 8, fontSize: "[0.875rem]", color: "[rgba(255, 255, 255, 0.6)]" })}>
                    Multiple images shown in the product detail gallery
                  </Text>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesUpload}
                    style={{
                      padding: "8px",
                      border: "1px solid #2E2E2E",
                      borderRadius: "4px",
                      backgroundColor: "black",
                      color: "white",
                      width: "100%",
                    }}
                  />
                  {formData.additionalImages && formData.additionalImages.length > 0 && (
                    <div style={style({ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 })}>
                      {formData.additionalImages.map((img, index) => (
                        <div key={index} style={{ position: "relative" }}>
                          <img
                            src={img}
                            alt={`Additional image ${index + 1}`}
                            style={{
                              width: 120,
                              height: 120,
                              borderRadius: 8,
                              objectFit: "cover",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveAdditionalImage(index)}
                            style={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              backgroundColor: "red",
                              color: "white",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 16,
                              fontWeight: "bold",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Text styles={style({ marginBottom: 12, fontWeight: "600" })}>Energy Properties *</Text>
                  <div style={style({ display: "flex", flexWrap: "wrap", gap: 8 })}>
                    {ENERGY_PROPERTIES.map((prop) => (
                      <button
                        key={prop}
                        type="button"
                        onClick={() => handlePropertyToggle(prop)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "999px",
                          border: `1px solid ${(formData.properties || []).includes(prop) ? primarycolor : "#2E2E2E"}`,
                          backgroundColor: (formData.properties || []).includes(prop) ? primarycolor : "transparent",
                          color: (formData.properties || []).includes(prop) ? "black" : "white",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        {prop}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={style({ display: "flex", gap: 16, flexWrap: "wrap" })}>
                  <label style={style({ display: "flex", alignItems: "center", gap: 8 })}>
                    <input
                      type="checkbox"
                      checked={formData.featured || false}
                      onChange={(e) => handleInputChange("featured", e.target.checked)}
                    />
                    <Text>Featured</Text>
                  </label>
                  <label style={style({ display: "flex", alignItems: "center", gap: 8 })}>
                    <input
                      type="checkbox"
                      checked={formData.inStock ?? true}
                      onChange={(e) => handleInputChange("inStock", e.target.checked)}
                    />
                    <Text>In Stock</Text>
                  </label>
                  <label style={style({ display: "flex", alignItems: "center", gap: 8 })}>
                    <input
                      type="checkbox"
                      checked={formData.isNew || false}
                      onChange={(e) => handleInputChange("isNew", e.target.checked)}
                    />
                    <Text>New Product</Text>
                  </label>
                  <label style={style({ display: "flex", alignItems: "center", gap: 8 })}>
                    <input
                      type="checkbox"
                      checked={formData.enabled ?? true}
                      onChange={(e) => handleInputChange("enabled", e.target.checked)}
                    />
                    <Text>Enabled</Text>
                  </label>
                  <label style={style({ display: "flex", alignItems: "center", gap: 8 })}>
                    <input
                      type="checkbox"
                      checked={formData.forHer || false}
                      onChange={(e) => handleInputChange("forHer", e.target.checked)}
                    />
                    <Text>For Her</Text>
                  </label>
                  <label style={style({ display: "flex", alignItems: "center", gap: 8 })}>
                    <input
                      type="checkbox"
                      checked={formData.forHim || false}
                      onChange={(e) => handleInputChange("forHim", e.target.checked)}
                    />
                    <Text>For Him</Text>
                  </label>
                </div>

                <div style={style({ display: "flex", gap: 12, marginTop: 8 })}>
                  <Button variant="primary" onPress={handleSave}>
                    {editingProduct ? "Update Product" : "Add Product"}
                  </Button>
                  <Button variant="secondary" onPress={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div style={style({ display: "flex", flexDirection: "column", gap: 16 })}>
            <Heading level={2} styles={style({ color: "white", marginBottom: 8 })}>
              Products ({products.length})
            </Heading>
            <div style={style({
              display: inventoryView === "grid" ? "grid" : "flex",
              gridTemplateColumns: inventoryView === "grid" ? "repeat(auto-fill, minmax(300px, 1fr))" : "none",
              flexDirection: inventoryView === "list" ? "column" : "row",
              gap: 16,
            })}>
            {products.map((product) => (
              <div
                key={product.id}
                style={style({
                  backgroundColor: "[#141414]",
                  border: "[1px solid #2E2E2E]",
                  borderRadius: "[8px]",
                  padding: 24,
                  display: "flex",
                  flexDirection: inventoryView === "grid" ? "column" : "row",
                  gap: 24,
                  opacity: product.enabled === false ? 0.5 : 1,
                })}
              >
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: inventoryView === "grid" ? "100%" : 120,
                      height: inventoryView === "grid" ? 200 : 120,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                )}
                <div style={style({ flex: 1, display: "flex", flexDirection: "column", gap: 8 })}>
                  <div style={style({ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" })}>
                    <Heading level={3} styles={style({ color: "white", margin: 0 })}>
                      {product.name}
                    </Heading>
                    {product.isNew && <Badge variant="informative">NEW</Badge>}
                    {product.salePercentage && (
                      <Badge variant="positive">{product.salePercentage}% OFF</Badge>
                    )}
                    {!product.enabled && <Badge variant="negative">Disabled</Badge>}
                    {!product.inStock && <Badge variant="negative">Out of Stock</Badge>}
                    {product.featured && <Badge variant="accent">Featured</Badge>}
                    {product.forHer && <Badge variant="informative">For Her</Badge>}
                    {product.forHim && <Badge variant="informative">For Him</Badge>}
                  </div>
                  <Text styles={style({ color: "[rgba(255, 255, 255, 0.7)]" })}>
                    {product.stone} • ${product.price}
                    {product.originalPrice && ` (was $${product.originalPrice})`}
                  </Text>
                  <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[0.875rem]" })}>
                    {product.description}
                  </Text>
                  <div style={style({ display: "flex", flexWrap: "wrap", gap: 4 })}>
                    {product.properties.map((prop) => (
                      <Badge key={prop} variant="neutral">
                        {prop}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div style={style({ display: "flex", flexDirection: inventoryView === "grid" ? "row" : "column", gap: 8, flexWrap: inventoryView === "grid" ? "wrap" : "nowrap" })}>
                  <ActionButton 
                    onClick={() => window.open(`/admin/preview/${product.id}`, '_blank')}
                    styles={style({ color: primarycolor })}
                  >
                    Preview
                  </ActionButton>
                  <ActionButton onClick={() => handleEdit(product)}>Edit</ActionButton>
                  <ActionButton
                    onClick={() => handleToggleEnabled(product.id)}
                    styles={style({
                      color: product.enabled ? "orange" : "green",
                    })}
                  >
                    {product.enabled ? "Disable" : "Enable"}
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleDelete(product.id)}
                    styles={style({ color: "red" })}
                  >
                    Delete
                  </ActionButton>
                </div>
              </div>
            ))}
            </div>
            </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div style={style({ display: "flex", flexDirection: "column", gap: 32 })}>
              <div style={style({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 16 })}>
                <Heading level={2} styles={style({ color: "white" })}>
                  Orders ({orderFilter === "all" ? orders.length : orders.filter(o => o.status === orderFilter).length})
                </Heading>
                
                {/* Filter Buttons */}
                <div style={style({ display: "flex", gap: 8, flexWrap: "wrap" })}>
                  <button
                    onClick={() => setOrderFilter("all")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: orderFilter === "all" ? `2px solid ${primarycolor}` : "1px solid #2E2E2E",
                      backgroundColor: orderFilter === "all" ? `${primarycolor}20` : "transparent",
                      color: orderFilter === "all" ? primarycolor : "white",
                      cursor: "pointer",
                      fontWeight: orderFilter === "all" ? "600" : "400",
                      transition: "all 0.2s",
                    }}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setOrderFilter("gathering")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: orderFilter === "gathering" ? `2px solid ${primarycolor}` : "1px solid #2E2E2E",
                      backgroundColor: orderFilter === "gathering" ? `${primarycolor}20` : "transparent",
                      color: orderFilter === "gathering" ? primarycolor : "white",
                      cursor: "pointer",
                      fontWeight: orderFilter === "gathering" ? "600" : "400",
                      transition: "all 0.2s",
                    }}
                  >
                    Gathering
                  </button>
                  <button
                    onClick={() => setOrderFilter("shipped")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: orderFilter === "shipped" ? `2px solid ${primarycolor}` : "1px solid #2E2E2E",
                      backgroundColor: orderFilter === "shipped" ? `${primarycolor}20` : "transparent",
                      color: orderFilter === "shipped" ? primarycolor : "white",
                      cursor: "pointer",
                      fontWeight: orderFilter === "shipped" ? "600" : "400",
                      transition: "all 0.2s",
                    }}
                  >
                    Shipped
                  </button>
                  <button
                    onClick={() => setOrderFilter("delivered")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: orderFilter === "delivered" ? `2px solid ${primarycolor}` : "1px solid #2E2E2E",
                      backgroundColor: orderFilter === "delivered" ? `${primarycolor}20` : "transparent",
                      color: orderFilter === "delivered" ? primarycolor : "white",
                      cursor: "pointer",
                      fontWeight: orderFilter === "delivered" ? "600" : "400",
                      transition: "all 0.2s",
                    }}
                  >
                    Delivered
                  </button>
                </div>
              </div>

              <div style={style({ display: "flex", flexDirection: "column", gap: 16 })}>
                {(orderFilter === "all" ? orders : orders.filter(order => order.status === orderFilter)).map((order) => (
                  <div
                    key={order.id}
                    style={style({
                      backgroundColor: "[#141414]",
                      border: "[1px solid #2E2E2E]",
                      borderRadius: "[8px]",
                      padding: 24,
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    })}
                  >
                    <div style={style({ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 16 })}>
                      <div style={style({ flex: 1, minWidth: 200 })}>
                        <div style={style({ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 })}>
                          <Heading level={3} styles={style({ color: "white", margin: 0, fontSize: "[20px]" })}>
                            {order.id}
                          </Heading>
                          <Badge
                            variant={
                              order.status === "delivered"
                                ? "positive"
                                : order.status === "shipped"
                                ? "informative"
                                : "neutral"
                            }
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        <Text styles={style({ color: "white", fontWeight: "600", marginBottom: 4 })}>
                          {order.customerName}
                        </Text>
                        {order.email && (
                          <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[0.875rem]", marginBottom: 4 })}>
                            {order.email}
                          </Text>
                        )}
                        {order.address && (
                          <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[0.875rem]" })}>
                            {order.address}
                          </Text>
                        )}
                      </div>
                      <div style={style({ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 })}>
                        <Text styles={style({ color: "white", fontWeight: "600", fontSize: "[18px]" })}>
                          ${order.total.toFixed(2)}
                        </Text>
                        <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[0.875rem]" })}>
                          {order.date}
                        </Text>
                      </div>
                    </div>

                    <div style={style({ paddingTop: 16, borderTop: "[1px solid #2E2E2E]" })}>
                      <Text styles={style({ color: "white", fontWeight: "600", marginBottom: 12 })}>
                        Order Details
                      </Text>
                      <div style={style({ display: "flex", gap: 12, alignItems: "center" })}>
                        {(() => {
                          const product = products.find(p => p.id === order.productId);
                          return product?.image ? (
                            <img
                              src={product.image}
                              alt={order.productName}
                              style={{
                                width: 80,
                                height: 80,
                                objectFit: "cover",
                                borderRadius: 8,
                              }}
                            />
                          ) : null;
                        })()}
                        <div style={style({ flex: 1 })}>
                          <Text styles={style({ color: "[rgba(255, 255, 255, 0.7)]", fontSize: "[0.875rem]", fontWeight: "600" })}>
                            {order.productName}
                          </Text>
                          <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]", fontSize: "[0.875rem]", marginTop: 4 })}>
                            Quantity: {order.quantity}
                          </Text>
                        </div>
                      </div>
                    </div>

                    <div style={style({ paddingTop: 16, borderTop: "[1px solid #2E2E2E]" })}>
                      <Text styles={style({ color: "white", fontWeight: "600", marginBottom: 12 })}>
                        Update Status
                      </Text>
                      <div style={style({ display: "flex", gap: 8, flexWrap: "wrap" })}>
                        <button
                          onClick={() => handleOrderStatusChange(order.id, "gathering")}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: order.status === "gathering" ? `2px solid ${primarycolor}` : "1px solid #2E2E2E",
                            backgroundColor: order.status === "gathering" ? `${primarycolor}20` : "transparent",
                            color: order.status === "gathering" ? primarycolor : "white",
                            cursor: "pointer",
                            fontWeight: order.status === "gathering" ? "600" : "400",
                            transition: "all 0.2s",
                          }}
                        >
                          Gathering
                        </button>
                        <button
                          onClick={() => handleOrderStatusChange(order.id, "shipped")}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: order.status === "shipped" ? `2px solid ${primarycolor}` : "1px solid #2E2E2E",
                            backgroundColor: order.status === "shipped" ? `${primarycolor}20` : "transparent",
                            color: order.status === "shipped" ? primarycolor : "white",
                            cursor: "pointer",
                            fontWeight: order.status === "shipped" ? "600" : "400",
                            transition: "all 0.2s",
                          }}
                        >
                          Shipped
                        </button>
                        <button
                          onClick={() => handleOrderStatusChange(order.id, "delivered")}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: order.status === "delivered" ? `2px solid ${primarycolor}` : "1px solid #2E2E2E",
                            backgroundColor: order.status === "delivered" ? `${primarycolor}20` : "transparent",
                            color: order.status === "delivered" ? primarycolor : "white",
                            cursor: "pointer",
                            fontWeight: order.status === "delivered" ? "600" : "400",
                            transition: "all 0.2s",
                          }}
                        >
                          Delivered
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {orders.length === 0 && (
                <div style={style({ textAlign: "center", padding: 48, color: "[rgba(255, 255, 255, 0.6)]" })}>
                  <Text>No orders yet</Text>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;

