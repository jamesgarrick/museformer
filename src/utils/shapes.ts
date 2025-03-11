// File: src/config/shapeStyles.ts
import React from "react";

export interface ShapeStyle {
  label: string;
  name: string;
  style: React.CSSProperties;
}

export const shapeStyles: ShapeStyle[] = [
  {
    label: "Elission Square",
    name: "ellision-square",
    style: {
      borderTop: "2px solid black",
      borderRight: "2px solid black",
      borderBottom: "0px solid black",
      borderLeft: "none",
      borderRadius: "0",
    },
  },
  {
    label: "Ellision Arc Left",
    name: "ellision-arc-left",
    style: {
      borderTop: "2px solid black",
      borderRight: "2px solid black",
      borderBottom: "none",
      borderLeft: "2px solid black",
      borderTopLeftRadius: "70px",
      marginLeft: "-15px",
      marginRight: "15px",
    },
  },
  {
    label: "Ellision Arc Right",
    name: "ellision-arc-right",
    style: {
      borderTop: "2px solid black",
      borderRight: "2px solid black",
      borderBottom: "none",
      borderLeft: "2px solid black",
      borderTopRightRadius: "70px",
      marginRight: "-15px",
    },
  },
  {
    label: "Dashed Line Top",
    name: "dash-line",
    style: {
      borderTop: "2px dashed black",
      borderRight: "none",
      borderBottom: "none",
      borderLeft: "none",
    },
  },
  {
    label: "Dashed Line",
    name: "dashed-line",
    style: {
      borderTop: "2px dashed black",
      borderRight: "2px dashed black",
      borderBottom: "none",
      borderLeft: "2px dashed black",
    },
  },
  {
    label: "Dashed Curve",
    name: "dashed-curve",
    style: {
      borderTop: "2px dashed black",
      borderRight: "2px dashed black",
      borderBottom: "none",
      borderLeft: "2px dashed black",
      borderTopRightRadius: "40px",
      borderTopLeftRadius: "40px",
    },
  },
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
