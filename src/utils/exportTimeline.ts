import { MusicalGroup } from "@/interfaces/MusicalGroup";

/**
 * Returns the timeline as a formatted JSON string.
 * @param timeline - The array of MusicalGroup objects.
 * @returns A string containing the timeline in JSON format.
 */
export function exportTimelineToJson(timeline: MusicalGroup[]): string {
  return JSON.stringify(timeline, null, 2);
}
