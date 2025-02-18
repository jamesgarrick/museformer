export interface MusicalGroup {
  id: string; // Unique identifier for the group
  startTime: number; // Start time in seconds
  endTime: number; // End time in seconds
  shape: "rectangle" | "circle" | "line" | string; // Visual shape (extendable)
  color: string; // Color for the group (e.g. hex code)
  text: string; // Single-line markdown text (for now plain text)
  children?: MusicalGroup[]; // Nested child groups
  layer?: number;
}
