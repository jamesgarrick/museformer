"use client";
import React, { useState, useRef } from "react";
import { MusicalGroup } from "@/interfaces/MusicalGroup";

interface MusicalGroupComponentProps {
  group: MusicalGroup;
  totalDuration: number; // Total timeline duration in seconds
  zoomLevel: number; // Zoom factor (1 = normal, >1 = zoomed in)
  selected?: boolean;
  onClick?: (id: string) => void;
  onTextChange?: (
    groupId: string,
    position: keyof MusicalGroup["texts"],
    newText: string
  ) => void;
}

const LAYER_HEIGHT = 100; // Height in pixels for each layer

const MusicalGroupComponent: React.FC<MusicalGroupComponentProps> = ({
  group,
  totalDuration,
  zoomLevel,
  selected = false,
  onClick,
  onTextChange,
}) => {
  // Compute the total timeline width in pixels (assuming viewport width is used)
  const timelineWidth = zoomLevel * window.innerWidth;
  // Compute horizontal positioning in pixels based on zoom.
  const leftPx = (group.startTime / totalDuration) * timelineWidth;
  const widthPx =
    ((group.endTime - group.startTime) / totalDuration) * timelineWidth;
  // Compute vertical positioning from the group's layer value
  const bottom = (group.layer ?? 0) * LAYER_HEIGHT;
  const height = LAYER_HEIGHT;

  // Local state for which text field is being edited
  const [editingField, setEditingField] = useState<
    keyof MusicalGroup["texts"] | null
  >(null);
  const [editingValue, setEditingValue] = useState("");

  // Ref to help distinguish between single and double tap
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Single tap handler on a text cell
  const handleTextClick = (
    position: keyof MusicalGroup["texts"],
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      if (onClick) onClick(group.id);
      clickTimeoutRef.current = null;
    }, 50);
  };

  // Double tap handler on a text cell
  const handleTextDoubleClick = (
    position: keyof MusicalGroup["texts"],
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    if (selected && onClick) {
      onClick(group.id);
    }
    setEditingField(position);
    setEditingValue(group.texts[position]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingValue(e.target.value);
  };

  const finishEditing = () => {
    if (editingField && onTextChange) {
      onTextChange(group.id, editingField, editingValue);
    }
    setEditingField(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      finishEditing();
    }
  };

  const gridContainerStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateAreas: `
      "topLeft topMiddle topRight"
      "middleLeft middleMiddle middleRight"
      "bottomLeft bottomMiddle bottomRight"
    `,
    gridTemplateColumns: "1fr 1fr 1fr",
    gridTemplateRows: "1fr 1fr 1fr",
    width: "100%",
    height: "100%",
  };

  const getTextAlign = (position: string): "left" | "center" | "right" => {
    if (position.endsWith("Left")) return "left";
    if (position.endsWith("Right")) return "right";
    return "center";
  };

  return (
    <div
      className="absolute box-border cursor-pointer pointer-events-auto border-t-2 border-l-2 border-r-2 border-b-0"
      style={{
        left: `${leftPx}px`,
        width: `${widthPx}px`,
        bottom: `${bottom}px`,
        height: `${height}px`,
        borderColor: "black",
        backgroundColor: "transparent",
      }}
      title={Object.values(group.texts).join(" | ")}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(group.id);
      }}
    >
      <div style={gridContainerStyle}>
        {Object.keys(group.texts).map((positionKey) => {
          const position = positionKey as keyof MusicalGroup["texts"];
          const textAlign = getTextAlign(position);
          const cellStyle: React.CSSProperties = {
            gridArea: position,
            textAlign,
            cursor: editingField === position ? "text" : "pointer",
            userSelect: "none",
            padding: "2px",
          };

          return (
            <div
              key={position}
              style={cellStyle}
              onClick={(e) => handleTextClick(position, e)}
              onDoubleClick={(e) => handleTextDoubleClick(position, e)}
            >
              {editingField === position ? (
                <input
                  type="text"
                  value={editingValue}
                  onChange={handleInputChange}
                  onBlur={finishEditing}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  style={{
                    width: "100%",
                    fontSize: "0.875rem",
                    border: "none",
                    outline: "none",
                    padding: 0,
                    margin: 0,
                    background: "transparent",
                    textAlign,
                  }}
                />
              ) : (
                <span style={{ fontSize: "0.875rem" }}>
                  {group.texts[position]}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {selected && (
        <div
          className="absolute inset-0 bg-blue-300 pointer-events-none"
          style={{ opacity: 0.15 }}
        ></div>
      )}
    </div>
  );
};

export default MusicalGroupComponent;
