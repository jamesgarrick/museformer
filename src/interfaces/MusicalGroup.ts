export interface MusicalGroup {
  id: string; // Unique identifier for the group
  startTime: number; // Start time in seconds
  endTime: number; // End time in seconds
  shape: "rectangle" | "circle" | "line" | string; // Visual shape (extendable)
  color: string; // Color for the group (e.g. hex code)
  texts: {
    topLeft: string;
    topMiddle: string;
    topRight: string;
    middleLeft: string;
    middleMiddle: string;
    middleRight: string;
    bottomLeft: string;
    bottomMiddle: string;
    bottomRight: string;
  };
  children?: MusicalGroup[]; // Nested child groups
  layer?: number;
}
