import { Heading, Text } from "./ui";
import { style } from "../utils/styles";

interface EnergyTileProps {
  title: string;
  description: string;
}

export const EnergyTile = ({ title, description }: EnergyTileProps) => (
  <div
    style={style({
      display: "flex",
      flexDirection: "column",
      gap: 8,
    })}
  >
    <Heading
      level={2}
      className="energy-card-heading"
      styles={style({
        fontWeight: "bold",
        color: "white",
      })}
    >
      {title}
    </Heading>
    <Text
      className="energy-card-description"
      styles={style({
        color: "white",
        lineHeight: "[1.7]",
      })}
    >
      {description}
    </Text>
  </div>
);




