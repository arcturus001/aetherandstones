import { useEffect, useState } from "react";
import { Text } from "./ui";
import { style } from "../utils/styles";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export const Toast = ({ message, type = "info", duration = 3000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "rgba(203, 109, 71, 0.15)";
      case "error":
        return "rgba(203, 109, 71, 0.15)";
      default:
        return "rgba(255, 255, 255, 0.1)";
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "rgba(203, 109, 71, 0.5)";
      case "error":
        return "rgba(203, 109, 71, 0.5)";
      default:
        return "rgba(255, 255, 255, 0.2)";
    }
  };

  return (
    <div
      style={style({
        position: "fixed",
        bottom: 24,
        right: 24,
        padding: "16px 24px",
        backgroundColor: getBackgroundColor(),
        border: `1px solid ${getBorderColor()}`,
        borderRadius: "[8px]",
        minWidth: "[300px]",
        maxWidth: "[400px]",
        zIndex: 10000,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.3s ease-in-out",
        boxShadow: "[0 4px 12px rgba(0, 0, 0, 0.3)]",
      })}
    >
      <Text styles={style({ color: "white", fontSize: "[14px]", lineHeight: "[1.5]" })}>
        {message}
      </Text>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type?: "success" | "error" | "info" }>;
  onRemove: (id: string) => void;
}

export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </>
  );
};


