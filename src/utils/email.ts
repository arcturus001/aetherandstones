/**
 * Email service using backend API endpoint
 * The backend handles Resend API calls server-side
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const ADMIN_EMAIL = "Petrosyan12123@gmail.com";

export interface ShippingInfo {
  fullName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  stone: string;
  properties: string[];
  image: string;
}

export interface OrderDetails {
  shipping: ShippingInfo;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingMethod: "express" | "standard";
}

/**
 * Format full address string
 */
export function formatFullAddress(shipping: ShippingInfo): string {
  return `${shipping.address}\n${shipping.city}, ${shipping.state} ${shipping.postalCode}\n${shipping.country}`;
}

/**
 * Send order notification email to admin via backend API
 */
export async function sendOrderNotificationEmail(orderDetails: OrderDetails): Promise<boolean> {
  try {
    const fullAddress = formatFullAddress(orderDetails.shipping);
    
    // Format each product with full details
    const itemsList = orderDetails.items
      .map((item, index) => {
        const itemTotal = item.price * item.quantity;
        const originalTotal = item.originalPrice ? item.originalPrice * item.quantity : null;
        const discount = originalTotal ? originalTotal - itemTotal : 0;
        
        return `
${index + 1}. ${item.name}
   Product ID: ${item.id}
   Stone: ${item.stone}
   Properties: ${item.properties.join(", ")}
   Description: ${item.description}
   Quantity: ${item.quantity}
   Unit Price: $${item.price.toFixed(2)}${item.originalPrice ? ` (Original: $${item.originalPrice.toFixed(2)})` : ""}
   Item Total: $${itemTotal.toFixed(2)}${discount > 0 ? ` (Saved: $${discount.toFixed(2)})` : ""}
   Image: ${item.image}
`;
      })
      .join("\n");

    const emailBody = `
═══════════════════════════════════════════════════════
                    NEW ORDER RECEIVED
═══════════════════════════════════════════════════════

CUSTOMER INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${orderDetails.shipping.fullName}
Email: ${orderDetails.shipping.email}

SHIPPING ADDRESS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${fullAddress}

ORDER DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${itemsList}

ORDER SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subtotal: $${orderDetails.subtotal.toFixed(2)}
Shipping Method: ${orderDetails.shippingMethod === "express" ? "Express" : "Standard"}
Shipping Cost: $${orderDetails.shippingCost.toFixed(2)}
───────────────────────────────────────────────────────
TOTAL: $${orderDetails.total.toFixed(2)}
═══════════════════════════════════════════════════════
`;

    console.log("Sending email via backend API...");

    const response = await fetch(`${API_BASE_URL}/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: [ADMIN_EMAIL],
        subject: `New Order from ${orderDetails.shipping.fullName}`,
        text: emailBody,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Email API error:", {
        status: response.status,
        data: responseData,
      });
      console.warn("Email notification failed, but order was processed successfully.");
      return false;
    }

    if (responseData.success) {
      console.log("✅ Email sent successfully! Email ID:", responseData.id);
      console.log("Check your inbox at:", ADMIN_EMAIL);
      return true;
    } else {
      console.warn("⚠️ Response OK but email send failed:", responseData);
      return false;
    }
  } catch (error) {
    console.error("Error sending email:", error);
    console.warn("Email notification failed, but order was processed successfully.");
    return false;
  }
}

