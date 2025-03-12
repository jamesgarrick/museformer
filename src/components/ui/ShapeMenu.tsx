"use client";

import React from "react";
import { ShapeButton } from "./ShapeButton";
import { shapeStyles } from "@/utils/shapes";

interface ShapeMenuProps {
  onShapeSelect: (shape: string) => void;
}

export function ShapeMenu({ onShapeSelect }: ShapeMenuProps) {
  return (
    <div>
      {/* Shape Group */}
      <div className="grid grid-cols-5 gap-3">
        {shapeStyles.map((s) => (
          <ShapeButton
            key={s.name}
            shape={s.name}
            label={s.label}
            onClick={() => onShapeSelect(s.name)}
          />
        ))}
      </div>
    </div>
  );
}
