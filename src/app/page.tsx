"use client";
import React, { useState, useRef, useEffect } from "react";
import YouTube, { YouTubeProps } from "react-youtube";

// Import shadcn/ui components (adjust paths as needed)
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Import our MusicalGroupComponent (which now accepts a 'level' prop to adjust vertical position)
import MusicalGroupComponent from "@/components/ui/MusicalGroupComponent";

// Import the MusicalGroup interface (which now includes an optional level property)
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
 */
function splitGroupAtTime(
  groups: MusicalGroup[],
  currentTime: number
): MusicalGroup[] {
  const index = groups.findIndex(
    (g) => g.startTime <= currentTime && currentTime < g.endTime
  );
  if (index === -1) return groups;
  const target = groups[index];
  if (currentTime <= target.startTime || currentTime >= target.endTime)
    return groups;

  const leftPart: MusicalGroup = {
    ...target,
    endTime: currentTime,
    text: target.text + " (left)",
    // Retain the same level as the original.
    level: target.level ?? 0,
  };

  const rightPart: MusicalGroup = {
    ...target,
    id: Date.now().toString() + Math.random().toString(36).substring(2),
    startTime: currentTime,
    text: target.text + " (right)",
    level: target.level ?? 0,
  };

  const newGroups = [...groups];
  newGroups.splice(index, 1, leftPart, rightPart);
  newGroups.sort((a, b) => a.startTime - b.startTime);
  return newGroups;
}

/**
 * Groups the selected groups into a new higher-level group.
 * The new parent's start is the minimum start and its end is the maximum end
 * among the selected groups. The selected groups become its children.
 * Its vertical level is set to one less than the minimum level among the selected groups,
 * so that it is rendered higher vertically.
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
  const minLevel = Math.min(...selectedGroups.map((g) => g.level ?? 0));
  const newParent: MusicalGroup = {
    id: Date.now().toString() + Math.random().toString(36).substring(2),
    startTime: minStart,
    endTime: maxEnd,
    shape: "rectangle",
    color: "#4CAF50",
    text: "Grouped",
    children: selectedGroups,
    level: minLevel - 1, // New parent appears above (vertically) its children.
  };

  // Remove the selected groups from the top level.
  const remaining = groups.filter((g) => !selectedIds.includes(g.id));
  const newGroups = [...remaining, newParent];
  newGroups.sort((a, b) => a.startTime - b.startTime);
  return newGroups;
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

  // Handle URL submission.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(youtubeUrl);
    if (id) {
      setVideoId(id);
    } else {
      alert("Please enter a valid YouTube URL");
    }
  };

  // When the YouTube player is ready, set up the player and the initial parent group.
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
        level: 0,
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

  // Seek the video when clicking on the timeline.
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !player || duration === 0) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    player.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const progressWidth = duration ? (currentTime / duration) * 100 : 0;

  // Toggle selection for a group.
  const toggleGroupSelection = (id: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id]
    );
  };

  // Split the group that contains the current time.
  const handleSplitGroup = () => {
    if (!player || duration === 0) return;
    const newGroups = splitGroupAtTime(groups, currentTime);
    setGroups(newGroups);
  };

  // Group the selected groups into a new higher-level group.
  const handleGroupSelected = () => {
    if (selectedGroupIds.length === 0) return;
    const newGroups = groupSelectedGroups(groups, selectedGroupIds);
    setGroups(newGroups);
    setSelectedGroupIds([]);
    console.log(groups);
  };

  return (
    <div className="min-h-screen flex">
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
            Split Group
          </Button>
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={handleGroupSelected}
            disabled={!videoId || selectedGroupIds.length === 0}
          >
            Group Selected
          </Button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-grow p-4">
        {!videoId ? (
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
        ) : (
          <div className="w-full relative">
            {/* Analysis Container: Render all groups above the timeline.
                The MusicalGroupComponent should use the group.level prop to apply a vertical offset.
            */}
            <div className="relative w-full h-20 bg-gray-200 mb-2">
              {groups.map((group) => (
                <MusicalGroupComponent
                  key={group.id}
                  group={group}
                  totalDuration={duration}
                  // Pass selection info and handler.
                  selected={selectedGroupIds.includes(group.id)}
                  onClick={toggleGroupSelection}
                />
              ))}
            </div>
            {/* Timeline Bar */}
            <div
              ref={timelineRef}
              className="w-full h-4 bg-gray-300 relative cursor-pointer mb-4"
              onClick={handleTimelineClick}
            >
              <div
                className="h-full bg-blue-500"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
            {/* Embedded YouTube Video */}
            <div className="flex justify-center">
              <YouTube
                videoId={videoId}
                opts={{
                  width: "640",
                  height: "360",
                  playerVars: { autoplay: 0 },
                }}
                onReady={onPlayerReady}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
