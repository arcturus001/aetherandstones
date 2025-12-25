import { Text } from "./ui";
import { style } from "../utils/styles";

export interface ShippingToastProps {
  threshold?: number;
  className?: string;
  styles?: React.CSSProperties;
}

export const ShippingToast: React.FC<ShippingToastProps> = ({
  threshold = 300,
  className = "",
  styles,
}) => {
  return (
    <div
      className={className}
      style={{
        padding: "16px",
        borderRadius: 12,
        border: "1px solid #594727",
        backgroundColor: "#1F1A11",
        textAlign: "center",
        ...styles,
      }}
    >
      <Text styles={style({ fontSize: "[16px]", color: "white" })}>
        ✨ Free Express Shipping on orders over ${threshold}
      </Text>
    </div>
  );
};







