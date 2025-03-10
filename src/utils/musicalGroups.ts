import { MusicalGroup } from "@/interfaces/MusicalGroup";
/**
 * Splits the group that contains the current playback time into two segments.
 */
export function splitGroupAtTime(
  groups: MusicalGroup[],
  currentTime: number
): MusicalGroup[] {
  const candidates = groups.filter(
    (g) => g.startTime <= currentTime && currentTime < g.endTime
  );
  if (candidates.length === 0) return groups;
  const target = candidates.reduce((prev, curr) =>
    (prev.layer ?? 0) <= (curr.layer ?? 0) ? prev : curr
  );
  if (currentTime <= target.startTime || currentTime >= target.endTime)
    return groups;
  const leftPart: MusicalGroup = {
    ...target,
    endTime: currentTime,
    texts: { ...target.texts },
    layer: target.layer ?? 0,
  };
  const rightPart: MusicalGroup = {
    ...target,
    id: Date.now().toString() + Math.random().toString(36).substring(2),
    startTime: currentTime,
    texts: { ...target.texts },
    layer: target.layer ?? 0,
  };
  const newGroups = [...groups];
  const index = newGroups.findIndex((g) => g.id === target.id);
  newGroups.splice(index, 1, leftPart, rightPart);
  newGroups.sort((a, b) => a.startTime - b.startTime);
  newGroups.forEach((grp) => {
    if (grp.children) {
      grp.children = grp.children.flatMap((child) =>
        child.id === target.id ? [leftPart, rightPart] : [child]
      );
    }
  });
  return newGroups;
}

/**
 * Groups the selected groups into a new higher-order (overlay) group.
 */
export function groupSelectedGroups(
  groups: MusicalGroup[],
  selectedIds: string[]
): MusicalGroup[] {
  if (selectedIds.length === 0) return groups;

  const selectedGroups = groups.filter((g) => selectedIds.includes(g.id));
  if (selectedGroups.length === 0) return groups;

  const minStart = Math.min(...selectedGroups.map((g) => g.startTime));
  const maxEnd = Math.max(...selectedGroups.map((g) => g.endTime));

  // Debug logs (optional)
  const DEBUG = true;
  if (DEBUG) {
    console.log("Selected groups:", selectedGroups);
    console.log("New grouping boundaries:", { minStart, maxEnd });
  }

  // Look for any parent group (a group with children) that has a boundary
  // (start or end) strictly within the new grouping span.
  const interferingParents = groups.filter((g) => {
    if (!g.children || g.children.length === 0) return false;
    // If a parent's startTime or endTime falls between minStart and maxEnd,
    // then it interferes.
    return (
      (g.startTime > minStart && g.startTime < maxEnd) ||
      (g.endTime > minStart && g.endTime < maxEnd)
    );
  });

  if (DEBUG) {
    console.log("Interfering parent groups:", interferingParents);
  }

  if (interferingParents.length > 0) {
    alert(
      "There is a parent group whose boundaries fall within the selected span – please adjust your selection."
    );
    return groups;
  }

  // Otherwise, create a new grouping.
  const maxSelectedLayer = Math.max(...selectedGroups.map((g) => g.layer ?? 0));
  const newGroup: MusicalGroup = {
    id: Date.now().toString() + Math.random().toString(36).substring(2),
    startTime: minStart,
    endTime: maxEnd,
    shape: "rectangle",
    color: "transparent",
    texts: {
      topLeft: "",
      topMiddle: "",
      topRight: "",
      middleLeft: "",
      middleMiddle: "",
      middleRight: "",
      bottomLeft: "",
      bottomMiddle: "",
      bottomRight: "",
    },
    children: selectedGroups,
    layer: maxSelectedLayer + 1,
  };

  if (DEBUG) {
    console.log("Created new standalone group:", newGroup);
  }

  return [...groups, newGroup].sort((a, b) => a.startTime - b.startTime);
}
