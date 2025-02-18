"use client";
import React from "react";
import { MusicalGroup } from "@/interfaces/MusicalGroup";

interface MusicalGroupComponentProps {
  group: MusicalGroup;
  totalDuration: number; // Total timeline duration in seconds
  selected?: boolean;
  onClick?: (id: string) => void;
}

const LAYER_HEIGHT = 30; // Height in pixels for each layer

const MusicalGroupComponent: React.FC<MusicalGroupComponentProps> = ({
  group,
  totalDuration,
  selected = false,
  onClick,
}) => {
  // Compute horizontal positioning
  const leftPercent = (group.startTime / totalDuration) * 100;
  const widthPercent =
    ((group.endTime - group.startTime) / totalDuration) * 100;

  // Compute vertical positioning directly from the group's layer value
  const bottom = (group.layer ?? 0) * LAYER_HEIGHT;
  const height = LAYER_HEIGHT;

  return (
    <div
      className="absolute box-border cursor-pointer pointer-events-auto border-t-2 border-l-2 border-r-2 border-b-0"
      style={{
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        bottom: `${bottom}px`,
        height: `${height}px`,
        borderColor: "black",
        backgroundColor: "transparent", // Only the border is visible
      }}
      title={group.text}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(group.id);
      }}
    >
      <span className="text-sm relative z-10">{group.text}</span>
      {selected && (
        <div className="absolute inset-0 bg-blue-300 opacity-50 z-0 pointer-events-none"></div>
      )}
    </div>
  );
};

export default MusicalGroupComponent;
