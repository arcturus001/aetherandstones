import { Divider, Heading, Text } from "../components/ui";
import { style } from "../utils/styles";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { products } from "../data/products";
import { PageHero } from "../components/PageHero";
import { ProductCard } from "../components/ProductCard";
import { BadgeTag } from "../components/BadgeTag";
import { EnergyTile } from "../components/EnergyTile";

const components = [
  {
    name: "PageHero",
    summary: "Reusable hero / callout block with background, title, subtitle, and optional disclaimer.",
    props: ["title: string", "subtitle: string", "disclaimer?: string"],
    usage: `<PageHero title="Collection" subtitle="Story" disclaimer="..." />`,
    visual: (
      <PageHero
        title="Page Hero"
        subtitle="Wrap any page hero in this structured callout."
        disclaimer="Use the disclaimer slot to call out copy that should appear immediately under the subtitle."
      />
    ),
  },
  {
    name: "ProductCard",
    summary: "Standard card used on the shop grid to present a bracelet and its key info.",
    props: ["product: Product"],
    usage: `<ProductCard product={products[0]} />`,
    visual: <ProductCard key="preview" product={products[0]} />,
  },
  {
    name: "EnergyTile",
    summary: "Encapsulates an energy heading and description so every Energy Guide card looks the same.",
    props: ["title: string", "description: string"],
    usage: `<EnergyTile title="Protection" description="..." />`,
    visual: <EnergyTile title="Protection" description="Support safety and grounding throughout the day." />,
  },
  {
    name: "BadgeTag",
    summary: "Small pill badge used for property and energy indicators.",
    props: ["label: string", "color?: string"],
    usage: `<BadgeTag label="Protection" color="#7ACB9E" />`,
    visual: <BadgeTag label="Protection" color="#7ACB9E" />,
  },
];

const ComponentsReadme = () => {
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
        <PageHero
          title="Component Catalog"
          subtitle="Reference and visual previews for the reusable building blocks in this project."
          disclaimer="Each section below includes the props you pass, a usage example, and a rendered preview."
        />

        <section
          style={style({
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 32,
            width: "100%",
            maxWidth: "[1200px]",
            marginX: "auto",
          })}
        >
          {components.map((component) => (
            <div
              key={component.name}
              style={style({
                border: "[1px solid #2E2E2E]",
                borderRadius: "[16px]",
                padding: "[24px]",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                backgroundColor: "[#141414]",
              })}
            >
              <Heading
                level={3}
                styles={style({
                  fontWeight: "bold",
                  color: "white",
                })}
              >
                {component.name}
              </Heading>
              <Text styles={style({ color: "[rgba(255, 255, 255, 0.6)]" })}>
                {component.summary}
              </Text>
              <Text styles={style({ fontSize: "[0.875rem]", color: "[rgba(255, 255, 255, 0.6)]" })}>
                Props: {component.props.join(", ")}
              </Text>
              <Text
                styles={style({
                  fontSize: "[0.875rem]",
                  backgroundColor: "[rgba(255,255,255,0.06)]",
                  padding: "[12px]",
                  borderRadius: "[8px]",
                })}
              >
                {component.usage}
              </Text>
              <div
                style={style({
                  border: "[1px solid rgba(255,255,255,0.1)]",
                  borderRadius: "[12px]",
                  padding: "[16px]",
                  backgroundColor: "[rgba(255,255,255,0.02)]",
                })}
              >
                {component.visual}
              </div>
            </div>
          ))}
        </section>

        <Divider size="L" className="semi-transparent-divider" />

        <section
          style={style({
            maxWidth: "[960px]",
            marginX: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          })}
        >
          <Heading level={4}>How to consume</Heading>
          <Text>
            Import any of these components from <code>@/components</code> and pass the documented props.
            You can render <code>ProductCard</code> inside grids, lists, or even detail pages; just make sure
            you provide a product shaped like the entries in <code>src/data/products.ts</code>.
          </Text>
          <Text>
            The shared <code>BadgeTag</code> helps keep energy/property pills consistent across pages, while
            <code>PageHero</code> enforces the styled hero + disclaimer pattern that both Shop and Energy Guide use.
          </Text>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ComponentsReadme;

