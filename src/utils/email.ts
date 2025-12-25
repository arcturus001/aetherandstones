/**
 * Email service using Resend API
 * Note: In production, this should be done server-side for security
 */

const RESEND_API_KEY = "re_geYv5cHQ_EmSgSKgQ5UXER2vyveVqesKv";
const RESEND_API_URL = "https://api.resend.com/emails";
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
 * Send order notification email to admin
 * NOTE: This may fail due to CORS restrictions. For production, use a backend API endpoint.
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

    const emailPayload = {
      from: "onboarding@resend.dev", // Resend default sender
      to: [ADMIN_EMAIL],
      subject: `New Order from ${orderDetails.shipping.fullName}`,
      text: emailBody,
    };

    console.log("=== RESEND EMAIL DEBUG ===");
    console.log("Sending email to Resend API...");
    console.log("API URL:", RESEND_API_URL);
    console.log("Payload:", JSON.stringify(emailPayload, null, 2));

    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    console.log("Response status:", response.status);
    console.log("Response statusText:", response.statusText);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    let responseData;
    try {
      const text = await response.text();
      console.log("Response text:", text);
      responseData = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      const text = await response.text().catch(() => "Unable to read response");
      responseData = { error: text, parseError: parseError instanceof Error ? parseError.message : String(parseError) };
    }

    console.log("Response data:", responseData);
    console.log("=== END RESEND EMAIL DEBUG ===");

    if (!response.ok) {
      console.error("Resend API error:", {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      });
      
      // Check for CORS error
      if (response.status === 0 || responseData.error?.includes("CORS")) {
        console.error("CORS ERROR: Resend API cannot be called directly from browser.");
        console.error("Solution: Use a backend API endpoint or serverless function to send emails.");
        alert("Email notification failed due to browser security restrictions. Please check the console for details. Order still processed.");
      } else {
        alert(`Email notification failed: ${responseData.message || response.statusText || "Unknown error"}. Order still processed.`);
      }
      return false;
    }

    if (responseData.id) {
      console.log("✅ Email sent successfully! Email ID:", responseData.id);
      console.log("Check your inbox at:", ADMIN_EMAIL);
      return true;
    } else {
      console.warn("⚠️ Response OK but no email ID returned:", responseData);
      return false;
    }
  } catch (error) {
    console.error("=== EMAIL ERROR ===");
    console.error("Error sending email:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      
      // Check for CORS error
      if (error.message.includes("CORS") || error.message.includes("Failed to fetch")) {
        console.error("CORS ERROR: Resend API cannot be called directly from browser.");
        console.error("Solution: Use a backend API endpoint or serverless function to send emails.");
        alert("Email notification failed due to browser security restrictions (CORS). Please check the console for details. Order still processed.");
      } else {
        alert(`Error sending email: ${error.message}. Order still processed.`);
      }
    } else {
      console.error("Unknown error:", error);
      alert(`Error sending email: Unknown error. Order still processed.`);
    }
    console.error("=== END EMAIL ERROR ===");
    return false;
  }
}

