// File: src/components/ui/ShapeButton.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface ShapeButtonProps {
  shape: string;
  label: string;
  onClick?: () => void;
}

export const ShapeButton: React.FC<ShapeButtonProps> = ({
  shape,
  label,
  onClick,
}) => {
  // Render a simple preview based on the shape type.
  let shapePreview;
  switch (shape) {
    case "rectangle":
      shapePreview = <div className="w-full h-full bg-gray-300" />;
      break;
    case "circle":
      shapePreview = <div className="w-full h-full bg-gray-300 rounded-full" />;
      break;
    case "line":
      shapePreview = <div className="w-full h-1 bg-gray-300 self-center" />;
      break;
    case "curved":
      shapePreview = <div className="w-full h-full bg-gray-300 rounded-t-md" />;
      break;
    default:
      shapePreview = <div className="w-full h-full bg-gray-300" />;
  }

  return (
    <Button
      variant="outline"
      size="none" // using a custom size variant that removes default padding/height
      onClick={onClick}
      className="shrink-0 w-full min-w-[120px] aspect-[3/2] p-0 m-0 flex flex-col items-stretch overflow-hidden rounded-md"
    >
      {/* Top 2/3: shape preview */}
      <div style={{ flex: 2 }} className="grow">
        {shapePreview}
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
