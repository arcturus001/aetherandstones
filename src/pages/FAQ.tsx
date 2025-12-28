import { Accordion, AccordionItem, Text } from "../components/ui";
import { style } from "../utils/styles";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { SEO } from "../components/SEO";
import { PageHero } from "../components/PageHero";

const faqs = [
  {
    question: "What is Aether & Stone?",
    answer:
      "Aether & Stone is a modern lifestyle brand focused on meaningful, energy-inspired jewelry. Each piece is designed with intention — blending natural stones, thoughtful design, and everyday wearability.",
  },
  {
    question: "What do the stones represent?",
    answer:
      "Each stone we use carries traditional symbolism rooted in centuries of cultural and spiritual belief. For example, amethyst is often associated with calm, clarity, and protection. While many people connect deeply with these meanings, our pieces are designed to be appreciated both symbolically and aesthetically.",
  },
  {
    question: "Are the stones natural?",
    answer:
      "Yes. We use natural stones, which means variations in color, texture, and pattern are normal — and part of what makes each piece unique. No two bracelets are exactly the same.",
  },
  {
    question: "Do your products have healing properties?",
    answer:
      "Our jewelry is not intended to diagnose, treat, or replace medical advice. The stones we use are valued for their symbolic and personal meaning. Any benefits experienced are personal and subjective.",
  },
  {
    question: "How should I care for my bracelet?",
    answer:
      "To keep your bracelet in its best condition: Avoid prolonged contact with water; Remove before intense physical activity; Store in a dry place when not in use. Gentle care helps preserve both the stones and the elastic over time.",
  },
  {
    question: "Is Aether & Stone jewelry unisex?",
    answer:
      "Yes. Our designs are intentionally minimal and balanced, created to be worn by anyone regardless of gender.",
  },
  {
    question: "What size are your bracelets?",
    answer:
      "Our bracelets are designed to fit most wrists comfortably. If sizing options are available, they will be clearly noted on the product page. If you’re unsure, feel free to contact us before ordering.",
  },
  {
    question: "Do you offer gift packaging?",
    answer:
      "Yes. All Aether & Stone pieces arrive in thoughtfully designed packaging, making them suitable for gifting without the need for additional wrapping.",
  },
  {
    question: "Where do you ship?",
    answer:
      "We currently ship to selected regions. Shipping availability, costs, and estimated delivery times are shown at checkout.",
  },
  {
    question: "Can I return or exchange an item?",
    answer:
      "We accept returns or exchanges on unworn items within the timeframe stated in our return policy. Please refer to our Returns & Exchanges page for full details.",
  },
  {
    question: "How can I contact you?",
    answer:
      "You can reach us anytime via the Contact page or by email. We aim to respond as quickly and thoughtfully as possible.",
  },
];

const FAQ = () => {
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
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
      <SEO 
        title="FAQ - Aether & Stones"
        description="Frequently asked questions about Aether & Stones bracelets, shipping, returns, care instructions, and more."
        structuredData={faqStructuredData}
      />
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
          title="FAQ"
          subtitle="Frequently Asked Questions"
          disclaimer="Need more help? Reach out via the Contact page and we'll respond as quickly and thoughtfully as possible."
        />

          <Accordion
            className="responsive-content-width"
            styles={style({
              marginX: "auto",
              width: "100%",
            })}
          >
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} title={faq.question}>
                <Text>{faq.answer}</Text>
              </AccordionItem>
            ))}
          </Accordion>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;

