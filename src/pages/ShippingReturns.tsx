import { Text, Heading } from "../components/ui";
import { style } from "../utils/styles";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { PageHero } from "../components/PageHero";

const sections = [
  {
    title: "Shipping",
    body: [
      "We currently offer two shipping options at checkout:",
      "",
      "Free Express Shipping",
      "Orders over $500 qualify for free express delivery.",
      "",
      "Standard Shipping",
      "Available for all orders via regular mail.",
      "",
      "Express Shipping",
      "Available at checkout for customers who prefer faster delivery.",
      "",
      "Shipping options, costs, and estimated delivery times are clearly displayed during checkout before payment is completed.",
    ],
  },
  {
    title: "Processing Time",
    body: [
      "Orders are typically processed within 1–3 business days.",
      "Once your order is shipped, you will receive a confirmation email with tracking details (where available).",
    ],
  },
  {
    title: "International Shipping",
    body: [
      "Shipping availability may vary by destination. Delivery times depend on location and selected shipping method.",
      "",
      "Please note that any customs duties, taxes, or import fees are determined by local authorities and are outside our control.",
    ],
  },
  {
    title: "Returns & Exchanges",
    body: [
      "We accept returns or exchanges for unworn items in their original condition within the timeframe stated in our return policy.",
      "",
      "To request a return or exchange:",
      "",
      "Contact us through our Contact page or email",
      "",
      "Include your order number and reason for the request",
      "",
      "Our team will guide you through the next steps",
      "",
      "Returned items must be unused, unworn, and in original packaging.",
    ],
  },
  {
    title: "A Thoughtful Note",
    body: [
      "We encourage customers to review product details and sizing carefully before ordering. Each piece is made with natural stones, making every item unique in appearance.",
    ],
  },
];

const ShippingReturns = () => (
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
      <PageHero
        title="Shipping & Returns"
        subtitle="Everything you need to know about shipping, processing, and returns."
      />
      <section
        className="responsive-content-width"
        style={style({
          marginX: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        })}
      >
        {sections.map((section) => (
          <div key={section.title} style={style({ display: "flex", flexDirection: "column", gap: 12, width: "640px" })}>
            <Heading
              level={2}
              styles={style({ fontWeight: "bold", fontSize: "[24px]", color: "white", marginBottom: 8 })}
            >
              {section.title}
            </Heading>
            {section.body.map((paragraph, index) => {
              if (paragraph === "") {
                return <div key={`spacer-${index}`} style={{ height: 12 }} />;
              }
              
              // Check if paragraph is a subheading (shipping option names, etc.)
              const isSubheading = paragraph.length > 0 && 
                /^[A-Z][^.!?]*$/.test(paragraph.trim()) && 
                paragraph.trim().length < 50 &&
                !paragraph.includes(".") &&
                index > 0 && section.body[index - 1] === "";
              
              // Check if it's a list item (starts with specific patterns)
              const isListItem = paragraph.includes("Contact us") || 
                                 paragraph.includes("Include your") ||
                                 paragraph.includes("Our team");
              
              return (
                <Text
                  key={`${section.title}-${index}`}
                  styles={style({
                    color: isSubheading 
                      ? "white" 
                      : "[rgba(255, 255, 255, 0.6)]",
                    lineHeight: "[1.7]",
                    fontWeight: isSubheading ? "600" : "normal",
                    marginLeft: isListItem ? 16 : 0,
                    marginTop: isSubheading ? 8 : 0,
                  })}
                >
                  {isListItem && "• "}
                  {paragraph}
                </Text>
              );
            })}
          </div>
        ))}
      </section>
    </main>
    <Footer />
  </div>
);

export default ShippingReturns;

