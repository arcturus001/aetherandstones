import { Badge } from "./ui";
import type { CSSProperties } from "react";

interface BadgeTagProps {
  label: string;
  color?: string;
}

export const BadgeTag = ({ label, color }: BadgeTagProps) => {
  const customStyles = color ? ({ "--badge-color": color } as CSSProperties) : undefined;

  return (
    <div style={customStyles}>
      <Badge variant="neutral" className="property-badge">
        {label}
      </Badge>
    </div>
  );
};




