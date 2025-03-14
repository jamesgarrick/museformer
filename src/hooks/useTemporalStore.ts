import { useStoreWithEqualityFn } from "zustand/traditional";
import type { TemporalState } from "zundo";
import { useProjectStore, ProjectStore } from "./useProjectStore";

export function useTemporalStore(): TemporalState<ProjectStore>;
export function useTemporalStore<T>(
  selector: (state: TemporalState<ProjectStore>) => T,
  equality?: (a: T, b: T) => boolean
): T;
export function useTemporalStore<T>(
  selector?: (state: TemporalState<ProjectStore>) => T,
  equality?: (a: T, b: T) => boolean
) {
  return useStoreWithEqualityFn(useProjectStore.temporal, selector!, equality);
}
