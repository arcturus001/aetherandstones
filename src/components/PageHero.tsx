import { Heading, Text } from "./ui";
import { style } from "../utils/styles";

interface PageHeroProps {
  title: string;
  subtitle: string;
  disclaimer?: string;
}

export const PageHero = ({ title, subtitle, disclaimer }: PageHeroProps) => {
  return (
    <div
      style={style({
        marginTop: "[32px]",
        padding: "[48px 32px 48px]",
        borderRadius: "[0px]",
        backgroundColor: "[#141414]",
        border: "[1px solid #2E2E2E]",
        boxShadow: "[0px 30px 60px rgba(0,0,0,0.4)]",
        display: "flex",
        flexDirection: "column",
        gap: "[16px]",
        alignItems: "center",
      })}
    >
      <Heading
        level={1}
        styles={style({
          fontWeight: "bold",
          fontFamily: "var(--primarytext)",
          color: "white",
          marginTop: "[0px]",
          marginBottom: "[0px]",
          textAlign: "center",
        })}
      >
        {title}
      </Heading>
      <Text
        className="page-hero-subtitle shop-subtitle-color page-hero-subtitle-spacing"
        styles={style({
          lineHeight: "[1.6]",
          textAlign: "center",
          marginTop: "[0px]",
          marginBottom: "[0px]",
        })}
      >
        {subtitle}
      </Text>
      {disclaimer && (
      <Text
        className="page-hero-disclaimer"
        styles={style({
          fontSize: "[0.875rem]",
          color: "[rgba(255, 255, 255, 0.6)]",
          textAlign: "center",
          maxWidth: "[640px]",
          marginTop: "[0px]",
          marginBottom: "[0px]",
        })}
      >
            {disclaimer}
          </Text>
      )}
    </div>
  );
};

