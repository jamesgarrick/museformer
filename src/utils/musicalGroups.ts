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
  const candidateParents = groups.filter((g) => {
    if (!g.children || g.children.length === 0) return false;
    const childIds = g.children.map((child) => child.id);
    return selectedGroups.every((sg) => childIds.includes(sg.id));
  });
  for (const parent of candidateParents) {
    const effectiveStart = Math.min(
      ...parent.children!.map((child) => child.startTime)
    );
    const effectiveEnd = Math.max(
      ...parent.children!.map((child) => child.endTime)
    );
    if (effectiveStart === minStart || effectiveEnd === maxEnd) {
      alert(
        "There is a parent group that starts or ends during the selected span - Boundaries cannot overlap like that (2)"
      );
      return groups;
    }
  }
  if (candidateParents.length > 0) {
    candidateParents.sort(
      (a, b) => a.endTime - a.startTime - (b.endTime - b.startTime)
    );
    const candidate = candidateParents[0];
    const newGroup: MusicalGroup = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      startTime: minStart,
      endTime: maxEnd,
      shape: "rectangle",
      color: "#4CAF50",
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
    return [...groups, newGroup].sort((a, b) => a.startTime - b.startTime);
  }
  const maxSelectedLayer = Math.max(...selectedGroups.map((g) => g.layer ?? 0));
  const newGroup: MusicalGroup = {
    id: Date.now().toString() + Math.random().toString(36).substring(2),
    startTime: minStart,
    endTime: maxEnd,
    shape: "rectangle",
    color: "#4CAF50",
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
  return [...groups, newGroup].sort((a, b) => a.startTime - b.startTime);
}
