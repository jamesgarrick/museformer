"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { getShapeStyle } from "@/utils/shapes";

interface ShapeButtonProps {
  shape: string;
  label: string;
  onClick?: () => void;
  className?: string;
  lineStyleOverride?: "solid" | "dashed";
}

export const ShapeButton: React.FC<ShapeButtonProps> = ({
  shape,
  label,
  onClick,
  className = "",
  lineStyleOverride,
}) => {
  // Get the style for the shape (clone it so we don't mutate the original)
  const shapeStyle = { ...getShapeStyle(shape) };

  // If a lineStyleOverride is provided, override all border styles
  if (lineStyleOverride) {
    shapeStyle.borderTop = `2px ${lineStyleOverride} var(--foreground)`;
    shapeStyle.borderRight = `2px ${lineStyleOverride} var(--foreground)`;
    shapeStyle.borderBottom = `2px ${lineStyleOverride} var(--foreground)`;
    shapeStyle.borderLeft = `2px ${lineStyleOverride} var(--foreground)`;
  }

  return (
    <Button
      variant="editor"
      size="none" // using a custom size variant that removes default padding/height
      onClick={onClick}
      className={`shrink-0 w-full min-w-[120px] aspect-[3/2] p-0 m-0 flex flex-col items-stretch overflow-hidden rounded-md ${className}`}
    >
      {/* Top 2/3: shape preview */}
      <div
        style={{ flex: 2, ...shapeStyle }}
        className="grow flex items-center justify-center m-2 !border-foreground"
      >
        {/* Optional additional content */}
      </div>
      {/* Bottom 1/3: label */}
      <div
        style={{ flex: 1 }}
        className="bg-card flex items-center justify-center"
      >
        <span className="text-foreground text-xs font-medium">{label}</span>
      </div>
    </Button>
  );
};
