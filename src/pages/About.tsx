import { Text } from "../components/ui";
import { style } from "../utils/styles";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { SEO } from "../components/SEO";
import { PageHero } from "../components/PageHero";
import aboutImage from "../Images/about.png";

const sections = [
  {
    title: "About Us",
    body: [
      "Aether & Stone was born in Armenia — a land of mountains, ancient paths, and stones shaped by time.",
      "Armenia sits at the crossroads of earth and history. Here, nature feels close and powerful: volcanic rock beneath your feet, clear highland air, deep silence in the mountains. Stone has always been part of Armenian life — from obsidian tools thousands of years old to churches carved directly from rock.",
      "That relationship with stone is what inspires everything we make.",
    ],
  },
  {
    title: "Our Philosophy",
    body: [
      "We believe jewelry can be more than decoration. It can be grounding. Intentional. Quietly powerful.",
      "Each Aether & Stone piece is designed to reflect balance between:",
      "Aether — the unseen, the breath, the inner world",
      "Stone — the tangible, the grounded, the enduring",
      "Our designs are minimal by choice. We let natural stones speak for themselves — their color, texture, and weight carrying meaning without excess.",
    ],
  },
  {
    title: "Inspired by the Land",
    body: [
      "Armenia’s landscape teaches patience and strength. Mountains don’t rush. Stones don’t pretend. They endure.",
      "We draw from this mindset when creating our bracelets:",
      "Natural stones with unique character",
      "Simple forms meant for everyday life",
      "Pieces that feel personal, not performative",
      "No two stones are the same — just like no two journeys are.",
    ],
  },
  {
    title: "Crafted with Intention",
    body: [
      "We design our pieces to be worn daily — during work, creation, rest, and reflection. They are made to live with you, not to stay untouched.",
      "Whether you connect with the symbolic meaning of the stones or simply appreciate their natural beauty, each piece is an invitation to slow down and stay grounded.",
    ],
  },
  {
    title: "From Armenia, With Meaning",
    body: [
      "Aether & Stone is rooted in Armenian nature and shaped for a modern world. It carries the calm of mountains, the depth of stone, and the belief that strength doesn’t need to be loud.",
      "This is our story. And now, it becomes part of yours.",
    ],
  },
];

const About = () => (
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
      title="About Us - Aether & Stones"
      description="Aether & Stone was born in Armenia — a land of mountains, ancient paths, and stones shaped by time. Learn about our philosophy and connection to Armenian nature."
      image="https://www.aetherandstones.com/about.png"
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
        title="About"
        subtitle="Our connection to Armenia and the stones that shape our story."
        disclaimer="Every bracelet we make carries the calm of mountains, the depth of stone, and a belief that strength can be quiet."
      />
      
      {/* Full bleed image */}
      <div
        style={{
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
          marginRight: "calc(-50vw + 50%)",
          height: "400px",
          overflow: "hidden",
          marginTop: -48,
        }}
      >
        <img
          src={aboutImage}
          alt="Armenian landscape with person prospecting in river"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
          }}
        />
      </div>

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

export default About;




