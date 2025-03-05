"use client";
import React, { useState } from "react";
import { MusicalGroup } from "@/interfaces/MusicalGroup";

interface MusicalGroupComponentProps {
  group: MusicalGroup;
  totalDuration: number; // Total timeline duration in seconds
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
  selected = false,
  onClick,
  onTextChange,
}) => {
  // Compute horizontal positioning
  const leftPercent = (group.startTime / totalDuration) * 100;
  const widthPercent =
    ((group.endTime - group.startTime) / totalDuration) * 100;
  // Compute vertical positioning directly from the group's layer value
  const bottom = (group.layer ?? 0) * LAYER_HEIGHT;
  const height = LAYER_HEIGHT;

  // Local state to track which text field (if any) is being edited
  const [editingField, setEditingField] = useState<
    keyof MusicalGroup["texts"] | null
  >(null);
  const [editingValue, setEditingValue] = useState("");

  // When a text element is double-clicked, switch to editing mode
  const handleDoubleClick = (
    position: keyof MusicalGroup["texts"],
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setEditingField(position);
    setEditingValue(group.texts[position]);
  };

  // Update the editing value on change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingValue(e.target.value);
  };

  // Commit the changes and exit editing mode (on blur or Enter key)
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

  // CSS grid container for text fields
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

  // Determine text alignment based on the key name
  const getTextAlign = (position: string): "left" | "center" | "right" => {
    if (position.endsWith("Left")) return "left";
    if (position.endsWith("Right")) return "right";
    return "center";
  };

  return (
    <div
      className="absolute box-border cursor-pointer pointer-events-auto border-t-2 border-l-2 border-r-2 border-b-0"
      style={{
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
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
          const style: React.CSSProperties = {
            gridArea: position,
            textAlign: getTextAlign(position),
            cursor: "text",
            userSelect: "none",
            padding: "2px",
          };

          return (
            <div
              key={position}
              style={style}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => handleDoubleClick(position, e)}
            >
              {editingField === position ? (
                <input
                  type="text"
                  value={editingValue}
                  onChange={handleInputChange}
                  onBlur={finishEditing}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  style={{ width: "100%", fontSize: "0.875rem" }}
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
        <div className="absolute inset-0 bg-blue-300 opacity-50 pointer-events-none"></div>
      )}
    </div>
  );
};

export default MusicalGroupComponent;
