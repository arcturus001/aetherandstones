import { style } from "../utils/styles";
import { LoadingSkeleton } from "./LoadingSkeleton";

export const AccountCardSkeleton = () => {
  return (
    <div
      style={style({
        maxWidth: "[600px]",
        width: "100%",
        padding: 32,
        backgroundColor: "[#141414]",
        border: "[2px solid rgba(203, 109, 71, 0.3)]",
        borderRadius: "[8px]",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      })}
    >
      <div style={style({ marginBottom: 8 })}>
        <LoadingSkeleton width="60%" height="24px" />
      </div>
      <div style={style({ marginBottom: 4 })}>
        <LoadingSkeleton width="100%" height="16px" />
      </div>
      <div style={style({ marginBottom: 16 })}>
        <LoadingSkeleton width="80%" height="16px" />
      </div>
      <div style={style({ display: "flex", gap: 12, marginTop: 8 })}>
        <LoadingSkeleton width="120px" height="40px" />
        <LoadingSkeleton width="100px" height="40px" />
      </div>
    </div>
  );
};

