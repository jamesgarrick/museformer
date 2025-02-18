"use client";
import React, { useState, useRef, useEffect } from "react";
import YouTube, { YouTubeProps } from "react-youtube";

// Import shadcn/ui components (adjust paths as needed)
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Import our MusicalGroupComponent and MusicalGroup interface.
import MusicalGroupComponent from "@/components/ui/MusicalGroupComponent";
import { MusicalGroup } from "@/interfaces/MusicalGroup";

// Helper function to extract the videoId from a YouTube URL.
function extractVideoId(url: string): string | null {
  const regExp =
    /^.*((youtu\.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
}

/**
 * Splits the group that contains the current playback time into two segments.
 * The left segment spans from the original start time to currentTime;
 * the right segment spans from currentTime to the original end time.
 *
 * Modification: If the target group is referenced in any parent’s children array,
 * update that array to replace the target with the two new split parts.
 */
function splitGroupAtTime(
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
    text: target.text + " (left)",
    layer: target.layer ?? 0,
  };

  const rightPart: MusicalGroup = {
    ...target,
    id: Date.now().toString() + Math.random().toString(36).substring(2),
    startTime: currentTime,
    text: target.text + " (right)",
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
 *
 * New behavior:
 * 1. We search for candidate parent groups (those with children) that completely
 *    enclose the selected groups (i.e. whose children include all selected groups).
 * 2. For each candidate parent, we compute its effective boundaries by taking the
 *    minimum start and maximum end among its children. If either the effective start equals
 *    the selected minimum or the effective end equals the selected maximum, then the selection
 *    touches the parent's boundary. In that case, we trigger an error:
 *
 *       "There is a parent group that starts or ends during the selected span - Boundaries cannot overlap like that (2)"
 *
 * 3. Otherwise, if a candidate parent exists, we perform hierarchical replacement:
 *    - Create a new group (with boundaries from the selected groups) that takes the candidate's layer.
 *    - Remove the selected groups from the candidate’s children and insert the new group.
 *    - Bump the candidate parent's layer by 1 so it remains above.
 *
 * 4. If no candidate parent is found, perform normal grouping by assigning the new group a layer
 *    one more than the highest layer among the selected groups.
 *
 * We continue using a flat array of groups (with an optional `children` array) for positioning.
 */
function groupSelectedGroups(
  groups: MusicalGroup[],
  selectedIds: string[]
): MusicalGroup[] {
  if (selectedIds.length === 0) return groups;
  const selectedGroups = groups.filter((g) => selectedIds.includes(g.id));
  if (selectedGroups.length === 0) return groups;

  const minStart = Math.min(...selectedGroups.map((g) => g.startTime));
  const maxEnd = Math.max(...selectedGroups.map((g) => g.endTime));

  // Find candidate parent groups whose children include all selected groups.
  const candidateParents = groups.filter((g) => {
    if (!g.children || g.children.length === 0) return false;
    const childIds = g.children.map((child) => child.id);
    return selectedGroups.every((sg) => childIds.includes(sg.id));
  });

  // For each candidate, compute its effective boundaries.
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

    // Hierarchical replacement:
    const newGroup: MusicalGroup = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      startTime: minStart,
      endTime: maxEnd,
      shape: "rectangle",
      color: "#4CAF50",
      text: "Grouped",
      children: selectedGroups,
      layer: candidate.layer, // new group takes candidate's current layer
    };

    candidate.children = candidate.children!.filter(
      (child) => !selectedIds.includes(child.id)
    );
    candidate.children.push(newGroup);
    candidate.layer = (candidate.layer ?? 0) + 1;

    return [...groups, newGroup].sort((a, b) => a.startTime - b.startTime);
  }

  // Otherwise, perform normal grouping.
  const maxSelectedLayer = Math.max(...selectedGroups.map((g) => g.layer ?? 0));
  const newGroup: MusicalGroup = {
    id: Date.now().toString() + Math.random().toString(36).substring(2),
    startTime: minStart,
    endTime: maxEnd,
    shape: "rectangle",
    color: "#4CAF50",
    text: "Grouped",
    children: selectedGroups,
    layer: maxSelectedLayer + 1,
  };

  return [...groups, newGroup].sort((a, b) => a.startTime - b.startTime);
}

const Home = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [groups, setGroups] = useState<MusicalGroup[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  const timelineRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(youtubeUrl);
    if (id) {
      setVideoId(id);
    } else {
      alert("Please enter a valid YouTube URL");
    }
  };

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    const ytPlayer = event.target;
    setPlayer(ytPlayer);
    const videoDuration = ytPlayer.getDuration();
    setDuration(videoDuration);

    if (groups.length === 0) {
      const parentGroup: MusicalGroup = {
        id: "parent-group",
        startTime: 0,
        endTime: videoDuration,
        shape: "rectangle",
        color: "#FF5733",
        text: "Entire Video",
        children: [],
        layer: 0,
      };
      setGroups([parentGroup]);
    }

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const time = ytPlayer.getCurrentTime();
      setCurrentTime(time);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !player || duration === 0) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    player.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const progressWidth = duration ? (currentTime / duration) * 100 : 0;

  const toggleGroupSelection = (id: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id]
    );
  };

  const handleSplitGroup = () => {
    if (!player || duration === 0) return;
    const newGroups = splitGroupAtTime(groups, currentTime);
    setGroups(newGroups);
  };

  const handleGroupSelected = () => {
    if (selectedGroupIds.length === 0) return;
    const newGroups = groupSelectedGroups(groups, selectedGroupIds);
    setGroups(newGroups);
    setSelectedGroupIds([]);
  };

  // Register keybinds: 's' for split and 'g' for group selected.
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement;
      if (
        active &&
        (active.tagName === "INPUT" || active.tagName === "TEXTAREA")
      ) {
        return;
      }
      if (e.key === "s" || e.key === "S") {
        handleSplitGroup();
      } else if (e.key === "g" || e.key === "G") {
        handleGroupSelected();
      }
    };
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("keydown", keyHandler);
    };
  }, [groups, selectedGroupIds, currentTime, duration]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content area */}
      <div className="flex flex-grow">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-100 p-4 border-r border-gray-300">
          <h2 className="text-xl font-bold mb-4">Tools</h2>
          <div className="space-y-2">
            <Button variant="outline" className="w-full">
              Text Analysis
            </Button>
            <Button variant="outline" className="w-full">
              Color Picker
            </Button>
            <Button variant="outline" className="w-full">
              Motif Grouping
            </Button>
            <Button variant="outline" className="w-full">
              Theme
            </Button>
            <Button variant="outline" className="w-full">
              Form Analysis
            </Button>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={handleSplitGroup}
              disabled={!videoId}
            >
              Split Group (S)
            </Button>
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={handleGroupSelected}
              disabled={!videoId || selectedGroupIds.length === 0}
            >
              Group Selected (G)
            </Button>
          </div>
        </aside>
        {/* Timeline/Analysis Container */}
        <div className="flex-grow flex flex-col justify-center items-center min-h-60">
          <div className="relative w-full max-w-4xl">
            <div className="relative w-full h-12 bg-gray-200 mb-2">
              {groups.map((group) => (
                <MusicalGroupComponent
                  key={group.id}
                  group={group}
                  totalDuration={duration}
                  selected={selectedGroupIds.includes(group.id)}
                  onClick={toggleGroupSelection}
                />
              ))}
            </div>
            <div
              ref={timelineRef}
              className="w-full h-4 bg-gray-300 relative cursor-pointer mb-2"
              onClick={handleTimelineClick}
            >
              <div
                className="h-full bg-blue-500"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Video Container */}
      <div className="h-[30vh] p-4">
        <div className="flex justify-center">
          {videoId && (
            <YouTube
              videoId={videoId}
              opts={{
                width: "640",
                height: "360",
                playerVars: { autoplay: 0 },
              }}
              onReady={onPlayerReady}
            />
          )}
        </div>
        {!videoId && (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md space-y-4 mx-auto"
          >
            <Input
              type="text"
              placeholder="Enter YouTube URL"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="w-full"
            />
            <Button type="submit" className="w-full">
              Load Video
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Home;
