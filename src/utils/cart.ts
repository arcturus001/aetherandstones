import { Product } from "../data/products";

export interface CartItem {
  productId: string;
  quantity: number;
}

const CART_STORAGE_KEY = "cart-items";

export const getCartItems = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveCartItems = (items: CartItem[]) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  localStorage.setItem("cart-count", String(totalCount));
  window.dispatchEvent(new CustomEvent("cart-update", { detail: totalCount }));
};

export const addToCart = (productId: string, quantity: number = 1) => {
  const items = getCartItems();
  const existingItem = items.find((item) => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    items.push({ productId, quantity });
  }
  
  saveCartItems(items);
};

export const removeFromCart = (productId: string) => {
  const items = getCartItems().filter((item) => item.productId !== productId);
  saveCartItems(items);
};

export const updateCartQuantity = (productId: string, quantity: number) => {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  
  const items = getCartItems();
  const item = items.find((item) => item.productId === productId);
  if (item) {
    item.quantity = quantity;
    saveCartItems(items);
  }
};

export const getCartTotal = (cartItems: CartItem[], products: Product[]): number => {
  return cartItems.reduce((total, cartItem) => {
    const product = products.find((p) => p.id === cartItem.productId);
    return total + (product ? product.price * cartItem.quantity : 0);
  }, 0);
};

export const clearCart = () => {
  localStorage.removeItem(CART_STORAGE_KEY);
  localStorage.setItem("cart-count", "0");
  window.dispatchEvent(new CustomEvent("cart-update", { detail: 0 }));
};




