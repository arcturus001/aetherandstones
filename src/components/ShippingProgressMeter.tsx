import { Text } from "./ui";
import { style } from "../utils/styles";
import { primarycolor } from "../styles/primaryColor";

export interface ShippingProgressMeterProps {
  currentTotal: number;
  threshold?: number;
}

export const ShippingProgressMeter: React.FC<ShippingProgressMeterProps> = ({
  currentTotal,
  threshold = 500,
}) => {
  const remaining = Math.max(0, threshold - currentTotal);
  const percentage = Math.min(100, (currentTotal / threshold) * 100);
  const isEligible = currentTotal >= threshold;

  return (
    <div
      style={{
        padding: "16px",
        borderRadius: 12,
        border: "1px solid #594727",
        backgroundColor: "#1F1A11",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {isEligible ? (
        <div
          style={style({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          })}
        >
          <Text
            styles={style({
              fontSize: "[14px]",
              color: primarycolor,
              fontWeight: "600",
            })}
          >
            ✨ You're eligible for free express shipping!
          </Text>
          <Text
            styles={style({
              fontSize: "[14px]",
              color: "white",
              fontWeight: "600",
            })}
          >
            ${currentTotal.toFixed(2)} / ${threshold}
          </Text>
        </div>
      ) : (
        <>
          <div
            style={style({
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            })}
          >
            <Text
              styles={style({
                fontSize: "[14px]",
                color: "[rgba(255, 255, 255, 0.7)]",
              })}
            >
              Add ${remaining.toFixed(2)} more for free express shipping
            </Text>
            <Text
              styles={style({
                fontSize: "[14px]",
                color: "white",
                fontWeight: "600",
              })}
            >
              ${currentTotal.toFixed(2)} / ${threshold}
            </Text>
          </div>
          <div
            style={{
              width: "100%",
              height: 8,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 4,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${percentage}%`,
                height: "100%",
                backgroundColor: primarycolor,
                borderRadius: 4,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

