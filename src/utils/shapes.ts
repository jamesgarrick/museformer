// File: src/config/shapeStyles.ts
import React from "react";

export interface ShapeStyle {
  label: string;
  name: string;
  style: React.CSSProperties;
}

export const shapeStyles: ShapeStyle[] = [
  {
    label: "Curve",
    name: "curve",
    style: {
      borderTop: "2px solid black",
      borderRight: "2px solid black",
      borderBottom: "none",
      borderLeft: "2px solid black",
      borderTopRightRadius: "50px",
      borderTopLeftRadius: "50px",
    },
  },
  {
    label: "Rectangle",
    name: "solid-rect",
    style: {
      borderTop: "2px solid black",
      borderRight: "2px solid black",
      borderBottom: "none",
      borderLeft: "2px solid black",
    },
  },
  {
    label: "Rectangle, No Right",
    name: "solid-rect-right-missing",
    style: {
      borderTop: "2px solid black",
      borderRight: "none",
      borderBottom: "none",
      borderLeft: "2px solid black",
    },
  },
  {
    label: "Rectangle, No Left",
    name: "solid-rect-left-missing",
    style: {
      borderTop: "2px solid black",
      borderRight: "2px solid black",
      borderBottom: "none",
      borderLeft: "none",
    },
  },
];

export const getShapeStyle = (shape: string): React.CSSProperties => {
  const found = shapeStyles.find((s) => s.name === shape);
  return found
    ? found.style
    : {
        borderTop: "2px solid black",
        borderRight: "2px solid black",
        borderBottom: "2px solid black",
        borderLeft: "2px solid black",
      };
};
