// File: src/utils/groups.ts
import { MusicalGroup } from "@/interfaces/MusicalGroup";

export interface DeleteGroupResult {
  updatedGroups: MusicalGroup[];
  error?: string;
}

export function deleteGroup(
  groups: MusicalGroup[],
  idToDelete: string
): DeleteGroupResult {
  // Find the group to delete.
  const groupToDelete = groups.find((g) => g.id === idToDelete);
  if (!groupToDelete) {
    return { updatedGroups: groups, error: "Group not found." };
  }

  // Check if this group is an immediate child of any parent group.
  const parentGroup = groups.find(
    (g) => g.children && g.children.some((child) => child.id === idToDelete)
  );
  if (parentGroup) {
    return {
      updatedGroups: groups,
      error:
        "This subgroup is part of a parent group. Please delete the parent group first.",
    };
  }

  // Proceed with deletion.
  const layer = groupToDelete.layer ?? 0;
  const sameLayerGroups = groups.filter(
    (g) => (g.layer ?? 0) === layer && g.id !== idToDelete
  );
  const leftNeighbor = sameLayerGroups
    .filter((g) => g.endTime <= groupToDelete.startTime)
    .sort((a, b) => b.endTime - a.endTime)[0];
  const rightNeighbor = sameLayerGroups
    .filter((g) => g.startTime >= groupToDelete.endTime)
    .sort((a, b) => a.startTime - b.startTime)[0];

  let newGroups = groups.filter((g) => g.id !== idToDelete);
  if (leftNeighbor) {
    newGroups = newGroups.map((g) =>
      g.id === leftNeighbor.id ? { ...g, endTime: groupToDelete.endTime } : g
    );
  } else if (rightNeighbor) {
    newGroups = newGroups.map((g) =>
      g.id === rightNeighbor.id
        ? { ...g, startTime: groupToDelete.startTime }
        : g
    );
  }
  newGroups = newGroups.map((g) => {
    if (g.children) {
      return {
        ...g,
        children: g.children.filter((child) => child.id !== idToDelete),
      };
    }
    return g;
  });
  return { updatedGroups: newGroups };
}
