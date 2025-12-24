import { Text } from "../components/ui";
import { style } from "../utils/styles";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { PageHero } from "../components/PageHero";

const sections = [
  {
    title: "What We Stand Behind",
    body: [
      "We guarantee that your Aether & Stone piece arrives free from manufacturing defects, including:",
      "Broken or defective clasps (if applicable)",
      "Faulty elastic at the time of delivery",
      "Incorrect item received",
      "If you believe your item arrived with a defect, please contact us within 7 days of delivery with your order number and clear photos.",
    ],
  },
  {
    title: "Natural Wear & Use",
    body: [
      "Our bracelets are made with natural stones and elastic components designed for everyday wear. Over time, normal use may lead to:",
      "Elastic stretching",
      "Surface marks on stones",
      "Natural changes in appearance",
      "These changes are part of the product’s life cycle and reflect personal use.",
    ],
  },
  {
    title: "What’s Not Covered",
    body: [
      "Damage caused by water exposure, impact, or improper care",
      "Stretching or breakage due to pulling, snagging, or overextension",
      "Wear resulting from daily use, exercise, or sleeping with the bracelet on",
      "Natural variations in stone color, texture, or pattern",
    ],
  },
  {
    title: "How to Request Support",
    body: [
      "Contact us via the Contact page or email",
      "Include your order number and photos of the item",
      "Our team will review your request and respond promptly",
      "Approved cases may be resolved with a replacement or store credit, at our discretion.",
    ],
  },
  {
    title: "A Thoughtful Note",
    body: [
      "Our pieces are designed to live with you — not to remain untouched. With mindful care, your bracelet will age beautifully and remain part of your everyday ritual.",
    ],
  },
];

const Warranty = () => (
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
        title="Warranty"
        subtitle="What we cover and how to reach us."
        disclaimer="Mindful care keeps your stones radiant; our warranty supports manufacturing defects for peace of mind."
      />
      <section
        style={style({
          maxWidth: "640px",
          marginX: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        })}
      >
        {sections.map((section) => (
          <div key={section.title} style={style({ display: "flex", flexDirection: "column", gap: 12 })}>
            <Text styles={style({ fontWeight: "bold", fontSize: "[24px]", color: "white" })}>
              {section.title}
            </Text>
            {section.body.map((paragraph) => (
              <Text key={paragraph} styles={style({ color: "[rgba(255, 255, 255, 0.6)]", lineHeight: "[1.7]" })}>
                {paragraph}
              </Text>
            ))}
          </div>
        ))}
      </section>
    </main>
    <Footer />
  </div>
);

export default Warranty;

