"use client";

import React, { useState, useRef } from "react";
import { MusicalGroup } from "@/interfaces/MusicalGroup";
import { getShapeStyle } from "@/utils/shapes";

interface MusicalGroupComponentProps {
  group: MusicalGroup;
  totalDuration: number;
  zoomLevel: number;
  selected?: boolean;
  onClick?: (id: string, multiSelect: boolean) => void;
  onTextChange?: (
    groupId: string,
    position: keyof MusicalGroup["texts"],
    newText: string
  ) => void;
}

const LAYER_HEIGHT = 100;

const MusicalGroupComponent: React.FC<MusicalGroupComponentProps> = ({
  group,
  totalDuration,
  zoomLevel,
  selected = false,
  onClick,
  onTextChange,
}) => {
  const timelineWidth = zoomLevel * window.innerWidth;
  const leftPx = (group.startTime / totalDuration) * timelineWidth;
  const widthPx =
    ((group.endTime - group.startTime) / totalDuration) * timelineWidth;
  const bottom = (group.layer ?? 0) * LAYER_HEIGHT;
  const height = LAYER_HEIGHT;

  const [editingField, setEditingField] = useState<
    keyof MusicalGroup["texts"] | null
  >(null);
  const [editingValue, setEditingValue] = useState("");
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTextClick = (
    position: keyof MusicalGroup["texts"],
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const multiSelect = e.metaKey;
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      if (onClick) onClick(group.id, multiSelect);
      clickTimeoutRef.current = null;
    }, 50);
  };

  const handleTextDoubleClick = (
    position: keyof MusicalGroup["texts"],
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const multiSelect = e.metaKey;
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    if (selected && onClick) {
      onClick(group.id, multiSelect);
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

  // Base style for position, sizing, and background.
  const baseStyle: React.CSSProperties = {
    left: `${leftPx}px`,
    width: `${widthPx}px`,
    bottom: `${bottom}px`,
    height: `${height}px`,
    backgroundColor: group.color,
  };

  // Combine the base style with shape-specific styles.
  const containerStyle: React.CSSProperties = {
    ...baseStyle,
    ...getShapeStyle(group.shape),
    overflow: "hidden", // Ensure inner content doesn't bleed
  };

  // Grid container remains unchanged.
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

  return (
    <div
      className="absolute box-border cursor-pointer pointer-events-auto overflow-hidden !border-foreground"
      style={containerStyle}
      title={Object.values(group.texts).join(" | ")}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(group.id, e.metaKey);
      }}
    >
      <div style={gridContainerStyle}>
        {Object.keys(group.texts).map((positionKey) => {
          const position = positionKey as keyof MusicalGroup["texts"];
          const isEditing = editingField === position;
          return (
            <TextCell
              key={position}
              text={group.texts[position]}
              isEditing={isEditing}
              editingValue={editingValue}
              textPosition={position}
              onTextClick={handleTextClick}
              onTextDoubleClick={handleTextDoubleClick}
              onInputChange={handleInputChange}
              onFinishEditing={finishEditing}
              onKeyDown={handleKeyDown}
            />
          );
        })}
      </div>
      {selected && (
        <div
          className="absolute inset-0 bg-blue-400 pointer-events-none"
          style={{ opacity: 0.25 }}
        ></div>
      )}
    </div>
  );
};

export default MusicalGroupComponent;

/**
 * The TextCell sub-component remains unchanged.
 */
interface TextCellProps {
  text: string;
  isEditing: boolean;
  editingValue: string;
  textPosition: keyof MusicalGroup["texts"];
  onTextClick: (
    position: keyof MusicalGroup["texts"],
    e: React.MouseEvent
  ) => void;
  onTextDoubleClick: (
    position: keyof MusicalGroup["texts"],
    e: React.MouseEvent
  ) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFinishEditing: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const TextCell: React.FC<TextCellProps> = ({
  text,
  isEditing,
  editingValue,
  textPosition,
  onTextClick,
  onTextDoubleClick,
  onInputChange,
  onFinishEditing,
  onKeyDown,
}) => {
  const getTextAlign = (position: string): "left" | "center" | "right" => {
    if (position.endsWith("Left")) return "left";
    if (position.endsWith("Right")) return "right";
    return "center";
  };

  const textAlign = getTextAlign(textPosition);

  return (
    <div
      style={{
        gridArea: textPosition,
        textAlign,
        cursor: isEditing ? "text" : "pointer",
        userSelect: "none",
        padding: "2px",
      }}
      onClick={(e) => onTextClick(textPosition, e)}
      onDoubleClick={(e) => onTextDoubleClick(textPosition, e)}
    >
      {isEditing ? (
        <input
          type="text"
          value={editingValue}
          onChange={onInputChange}
          onBlur={onFinishEditing}
          onKeyDown={onKeyDown}
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
        <span
          className="block w-full truncate"
          style={{
            fontSize: "0.875rem",
            textAlign,
          }}
        >
          {text}
        </span>
      )}
    </div>
  );
};
