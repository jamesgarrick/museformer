"use client";
import React from "react";
import { MusicalGroup } from "@/interfaces/MusicalGroup";

interface MusicalGroupComponentProps {
  group: MusicalGroup;
  totalDuration: number; // Total timeline duration in seconds
  selected?: boolean;
  onClick?: (id: string) => void;
}

const MusicalGroupComponent: React.FC<MusicalGroupComponentProps> = ({
  group,
  totalDuration,
  selected = false,
  onClick,
}) => {
  // Compute the left offset and width as percentages of the total timeline
  const leftPercent = (group.startTime / totalDuration) * 100;
  const widthPercent =
    ((group.endTime - group.startTime) / totalDuration) * 100;

  // Compute the vertical offset based on the group's level.
  // For example, level = 0 => top: 0; level = -1 => top: -20px; level = 1 => top: 20px.
  const verticalOffset = (group.level !== undefined ? group.level : 0) * 20;

  return (
    <div
      className="absolute box-border cursor-pointer pointer-events-auto border-t-2 border-l-2 border-r-2 border-b-0"
      style={{
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        top: `${verticalOffset}px`,
        borderColor: "black",
        // The background remains transparent so only the borders are visible.
        backgroundColor: "transparent",
      }}
      title={group.text}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) {
          onClick(group.id);
        }
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
