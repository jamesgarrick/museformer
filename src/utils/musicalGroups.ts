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

  // First, check if an exact grouping already exists.
  const selectedSet = new Set(selectedIds);
  const existingGroup = groups.find(
    (g) =>
      g.children &&
      g.children.length === selectedIds.length &&
      g.children.every((child) => selectedSet.has(child.id))
  );
  if (existingGroup) {
    alert(
      "There is already a higher group that only contains the selected groups (1)"
    );
    return groups;
  }

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

  // Look for interfering parent groups (those with children) whose boundaries fall within
  // the new span, but only consider those that are NOT already selected.
  const interferingParents = groups.filter((g) => {
    if (!g.children || g.children.length === 0) return false;
    if (selectedIds.includes(g.id)) return false; // ignore if already selected
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

  // If there is at least one candidate parent already containing all selected groups, use it.
  const candidateParents = groups.filter((g) => {
    if (!g.children || g.children.length === 0) return false;
    const childIds = g.children.map((child) => child.id);
    return selectedGroups.every((sg) => childIds.includes(sg.id));
  });

  if (candidateParents.length > 0) {
    candidateParents.sort(
      (a, b) => a.endTime - a.startTime - (b.endTime - b.startTime)
    );
    const candidate = candidateParents[0];
    if (DEBUG) {
      console.log("Using candidate parent:", candidate);
    }
    const newGroup: MusicalGroup = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      startTime: minStart,
      endTime: maxEnd,
      shape: "curve",
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
      layer: candidate.layer,
    };
    candidate.children = candidate.children!.filter(
      (child) => !selectedIds.includes(child.id)
    );
    candidate.children.push(newGroup);
    candidate.layer = (candidate.layer ?? 0) + 1;
    if (DEBUG) {
      console.log("Created new group under candidate parent:", newGroup);
    }
    return [...groups, newGroup].sort((a, b) => a.startTime - b.startTime);
  }

  // If no candidate parent exists, create a new standalone group.
  const maxSelectedLayer = Math.max(...selectedGroups.map((g) => g.layer ?? 0));
  const newGroup: MusicalGroup = {
    id: Date.now().toString() + Math.random().toString(36).substring(2),
    startTime: minStart,
    endTime: maxEnd,
    shape: "curve",
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
