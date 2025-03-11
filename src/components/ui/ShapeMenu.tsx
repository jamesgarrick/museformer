"use client";

import React, { useState } from "react";
import { ShapeButton } from "./ShapeButton";
import { shapeStyles } from "@/utils/shapes";

interface ShapeMenuProps {
  onShapeSelect: (shape: string) => void;
}

export function ShapeMenu({ onShapeSelect }: ShapeMenuProps) {
  // Local state for line style, defaulting to "solid-line"
  const [lineStyle, setLineStyle] = useState("line-type");

  // Handler for toggling line style buttons
  const handleLineStyleSelect = (style: string) => {
    setLineStyle(style);
    onShapeSelect(style);
  };

  return (
    <div>
      {/* Header for line style toggle */}
      <div className="flex flex-row flex-nowrap border bg-white h-10 mb-2 p-3 items-center rounded-md">
        <span className="w-fit p-1 text-xs">Line Style</span>
        <ShapeButton
          shape="solid-line"
          label=""
          onClick={() => handleLineStyleSelect("solid-line")}
          className={`!min-w-0 !w-16 !h-8 m-1 ${
            lineStyle === "solid" ? "bg-blue-200" : ""
          }`}
        />
        <ShapeButton
          shape="dashed-line"
          label=""
          onClick={() => handleLineStyleSelect("dashed-line")}
          className={`!min-w-0 !w-16 !h-8 m-1 ${
            lineStyle === "dashed" ? "bg-blue-200" : ""
          }`}
        />
      </div>

      {/* Existing group: All shape types */}
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
