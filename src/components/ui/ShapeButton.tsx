// File: src/components/ui/ShapeButton.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { getShapeStyle } from "@/utils/shapes";

interface ShapeButtonProps {
  shape: string;
  label: string;
  onClick?: () => void;
  className?: string;
}

export const ShapeButton: React.FC<ShapeButtonProps> = ({
  shape,
  label,
  onClick,
  className = "",
}) => {
  // Get the style for the shape
  const shapeStyle = getShapeStyle(shape);

  return (
    <Button
      variant="outline"
      size="none" // using a custom size variant that removes default padding/height
      onClick={onClick}
      className={`shrink-0 w-full min-w-[120px] aspect-[3/2] p-0 m-0 flex flex-col items-stretch overflow-hidden rounded-md ${className}`}
    >
      {/* Top 2/3: shape preview */}
      <div
        style={{ flex: 2, ...shapeStyle }}
        className="grow flex items-center justify-center m-2"
      >
        {/* You can add additional content here if needed */}
      </div>
      {/* Bottom 1/3: label */}
      <div
        style={{ flex: 1 }}
        className="bg-white flex items-center justify-center"
      >
        <span className="text-black text-xs font-medium">{label}</span>
      </div>
    </Button>
  );
};
