import { Text } from "../components/ui";
import { style } from "../utils/styles";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { PageHero } from "../components/PageHero";

const sections = [
  {
    title: "Wearing Your Bracelet",
    body: [
      "Put your bracelet on gently by rolling it over your hand, not pulling or stretching it.",
      "Remove it before intense physical activity, heavy lifting, or sports.",
      "Avoid wearing it while sleeping to reduce unnecessary tension on the elastic.",
    ],
  },
  {
    title: "Water & Moisture",
    body: [
      "Remove your bracelet before showering, swimming, or bathing.",
      "Avoid prolonged exposure to water, especially saltwater or chlorinated pools.",
      "Let stones dry naturally if they come into contact with moisture.",
    ],
  },
  {
    title: "Cleaning",
    body: [
      "Wipe stones gently with a soft, dry cloth.",
      "Avoid chemical cleaners, soaps, or abrasive materials.",
      "For energetic care, some customers choose to place their bracelet in moonlight or near natural elements — this is optional and personal.",
    ],
  },
  {
    title: "Storage",
    body: [
      "Store your bracelet in a dry place when not in use.",
      "Keep it in its original pouch or box to prevent scratches or tangling.",
      "Avoid placing heavy objects on top of it.",
    ],
  },
  {
    title: "Natural Variations",
    body: [
      "Each Aether & Stone bracelet is made with natural stones. Variations in color, pattern, and texture are normal and part of what makes your piece unique.",
    ],
  },
  {
    title: "When to Replace",
    body: [
      "Over time, elastic may naturally loosen with frequent wear. This is normal for stretch jewelry. If your bracelet shows signs of wear, we recommend replacing it to maintain comfort and security.",
    ],
  },
  {
    title: "A Note on Intention",
    body: [
      "Many people choose to treat their bracelet as a personal reminder — of calm, focus, or protection. However you connect with it, let it be something that supports your daily rhythm.",
    ],
  },
];

const CareGuide = () => (
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
        title="Care Guide"
        subtitle="Preserve your intention and keep each bracelet looking its best."
        disclaimer="Gentle routine care guards your stones and elastic while keeping the beauty and energy of each piece intact."
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

export default CareGuide;

