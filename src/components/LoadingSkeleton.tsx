import { style } from "../utils/styles";

interface LoadingSkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
}

export const LoadingSkeleton = ({ 
  width = "100%", 
  height = "20px", 
  borderRadius = "4px" 
}: LoadingSkeletonProps) => {
  return (
    <div
      style={style({
        width,
        height,
        borderRadius,
        backgroundColor: "[rgba(255, 255, 255, 0.1)]",
        animation: "pulse 1.5s ease-in-out infinite",
      })}
    />
  );
};

export const OrderSkeleton = () => {
  return (
    <div
      style={style({
        padding: 24,
        backgroundColor: "[#141414]",
        border: "[1px solid #2E2E2E]",
        borderRadius: "[8px]",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      })}
    >
      <div style={style({ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16 })}>
        <div style={style({ display: "flex", flexDirection: "column", gap: 8, flex: 1 })}>
          <LoadingSkeleton width="150px" height="24px" />
          <LoadingSkeleton width="120px" height="16px" />
        </div>
        <LoadingSkeleton width="80px" height="24px" />
      </div>
      <div style={style({ display: "flex", flexDirection: "column", gap: 8 })}>
        <LoadingSkeleton width="100%" height="16px" />
        <LoadingSkeleton width="80%" height="16px" />
      </div>
    </div>
  );
};

export const AddressSkeleton = () => {
  return (
    <div
      style={style({
        padding: 32,
        backgroundColor: "[#141414]",
        border: "[1px solid #2E2E2E]",
        borderRadius: "[8px]",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      })}
    >
      <LoadingSkeleton width="200px" height="24px" />
      <div style={style({ display: "flex", flexDirection: "column", gap: 8 })}>
        <LoadingSkeleton width="100%" height="16px" />
        <LoadingSkeleton width="90%" height="16px" />
        <LoadingSkeleton width="70%" height="16px" />
      </div>
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <div
      style={style({
        padding: 32,
        backgroundColor: "[#141414]",
        border: "[1px solid #2E2E2E]",
        borderRadius: "[8px]",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      })}
    >
      <LoadingSkeleton width="200px" height="24px" />
      <div style={style({ display: "flex", flexDirection: "column", gap: 16 })}>
        <div style={style({ display: "flex", flexDirection: "column", gap: 8 })}>
          <LoadingSkeleton width="80px" height="14px" />
          <LoadingSkeleton width="100%" height="48px" borderRadius="8px" />
        </div>
        <div style={style({ display: "flex", flexDirection: "column", gap: 8 })}>
          <LoadingSkeleton width="80px" height="14px" />
          <LoadingSkeleton width="100%" height="48px" borderRadius="8px" />
        </div>
      </div>
    </div>
  );
};

