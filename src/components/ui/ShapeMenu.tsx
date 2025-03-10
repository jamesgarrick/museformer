// File: src/components/ui/ShapeMenu.tsx
"use client";

import React from "react";
import { ShapeButton } from "./ShapeButton";

interface ShapeMenuProps {
  onShapeSelect: (shape: string) => void;
}

export function ShapeMenu({ onShapeSelect }: ShapeMenuProps) {
  const shapes = [
    { shape: "rectangle", label: "Rectangle" },
    { shape: "curved", label: "Curved" },
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {shapes.map((s) => (
        <ShapeButton
          key={s.label}
          shape={s.shape}
          label={s.label}
          onClick={() => onShapeSelect(s.shape)}
        />
      ))}
    </div>
  );
}
