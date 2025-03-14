"use client";

import MediaControls from "@/components/MediaControls";
import Timeline from "@/components/Timeline";
import { Button } from "@/components/ui/button";
import { ColorMenu } from "@/components/ui/ColorMenu";
import { Header } from "@/components/ui/editor/Header";
import { Input } from "@/components/ui/input";
import MusicalGroupComponent from "@/components/ui/MusicalGroupComponent";
import { ShapeMenu } from "@/components/ui/ShapeMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePlayerControls } from "@/hooks/usePlayerControls";
import { MusicalGroup } from "@/interfaces/MusicalGroup";
import { groupSelectedGroups, splitGroupAtTime } from "@/utils/musicalGroups";
import { extractVideoId } from "@/utils/youtube";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTemporalStore } from "@/hooks/useTemporalStore";
import YouTube, { YouTubeProps } from "react-youtube";

import { useProjectStore } from "@/hooks/useProjectStore";
import { deleteGroup } from "@/utils/groups";

// TO FUTURE SELF
// MOVE LIGHT, DARK MODE TO SEPARATE STORAGE
// ZOOM LEVEL SHOULD NOT BE SENT TO DB

// ACTIVE PROJECTS SHOULD NOT BE CONST,
// SHOULD BE REACTIVE SO IT CAN UPDATE IRL

// MENUBAR HOVER BG DOESNT WORK

// add settings menu
// separate this file, it is getting way too long
// add cloudflare k/v storage for saving projects and sharing with others
// also means adding some import function to save that project to auto add to local storage.

// Extend your submenu enum:
enum SubMenu {
  NONE = "NONE",
  COLORS = "COLORS",
  SHAPES = "SHAPES",
}

const Home = () => {
  const {
    setGroups,
    setVideoId,
    setYoutubeUrl,
    setTimelineScroll,
    setZoomLevel,
    activeProject: { zoomLevel, groups, youtubeUrl, timelineScroll, videoId },
  } = useProjectStore();

  // Zoom level as a reactive variable; 2 means 200vw, etc.
  const containerWidthVW = zoomLevel * 100; // in vw units

  // Other state variables...
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [innerWidth, setInnerWidth] = useState(0);

  const [activeSubMenu, setActiveSubMenu] = useState<SubMenu>(SubMenu.NONE);

  // Zoom controls...
  useEffect(() => {
    setInnerWidth(window.innerWidth);
    const handleZoom = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement;
      if (
        active &&
        (active.tagName === "INPUT" || active.tagName === "TEXTAREA")
      )
        return;
      if (e.key === "=" || e.key === "+") setZoomLevel(zoomLevel + 0.25);
      else if (e.key === "-" || e.key === "_")
        setZoomLevel(Math.max(0.5, zoomLevel - 0.25));
    };
    window.addEventListener("keydown", handleZoom);
    return () => window.removeEventListener("keydown", handleZoom);
  }, [zoomLevel, setZoomLevel]);

  const temporalStore = useTemporalStore();

  useEffect(() => {
    const handleUndoRedo = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement;
      if (
        active &&
        (active.tagName === "INPUT" || active.tagName === "TEXTAREA")
      ) {
        return;
      }
      if (e.ctrlKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        temporalStore.undo();
      } else if (e.ctrlKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        temporalStore.redo();
      }
    };
    window.addEventListener("keydown", handleUndoRedo);
    return () => window.removeEventListener("keydown", handleUndoRedo);
  }, [temporalStore]);

  const handleColorSelect = useCallback(
    (color: string) => {
      if (selectedGroupIds.length === 0) return;
      const newGroups = groups.map((group: MusicalGroup) =>
        selectedGroupIds.includes(group.id) ? { ...group, color } : group
      );
      setGroups(newGroups);
    },
    [selectedGroupIds, setGroups, groups]
  );

  const handleShapeSelect = useCallback(
    (shape: string) => {
      if (selectedGroupIds.length === 0) return;
      const newGroups = groups.map((group: MusicalGroup) =>
        selectedGroupIds.includes(group.id) ? { ...group, shape } : group
      );
      setGroups(newGroups);
    },
    [selectedGroupIds, setGroups, groups]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(youtubeUrl);
    if (id) setVideoId(id);
    else alert("Please enter a valid YouTube URL");
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

  const onPlayerStateChange: YouTubeProps["onStateChange"] = (event) => {
    setIsPlaying(event.data === 1);
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
    const totalWidth = zoomLevel * innerWidth;
    const newTime = ((clickX + timelineScroll) / totalWidth) * duration;
    player.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const toggleGroupSelection = (id: string, multiSelect: boolean) => {
    if (multiSelect)
      setSelectedGroupIds((prev) =>
        prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id]
      );
    else
      setSelectedGroupIds((prev) =>
        prev.length === 1 && prev[0] === id ? [] : [id]
      );
  };

  const handleTextChange = (
    groupId: string,
    position: keyof MusicalGroup["texts"],
    newText: string
  ) => {
    const newGroups = groups.map((g: MusicalGroup) =>
      g.id === groupId
        ? { ...g, texts: { ...g.texts, [position]: newText } }
        : g
    );
    setGroups(newGroups);
  };

  const handleSplitGroup = useCallback(() => {
    if (!player || duration === 0) return;
    const newGroups = splitGroupAtTime(groups, currentTime);
    setGroups(newGroups);
  }, [player, duration, groups, currentTime]);

  const handleGroupSelected = useCallback(() => {
    if (selectedGroupIds.length < 2) {
      alert("Please select at least two groups to group them.");
      return;
    }
    const newGroups = groupSelectedGroups(groups, selectedGroupIds);
    setGroups(newGroups);
    setSelectedGroupIds([]);
  }, [groups, selectedGroupIds]);

  const handleBeginning = () => {
    if (player) {
      player.seekTo(0, true);
      setCurrentTime(0);
    }
  };

  const handlePlay = () => {
    if (player) {
      const state = player.getPlayerState();
      if (state === 1) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }
  };

  const handleRewind = useCallback(() => {
    if (player) {
      const newTime = Math.max(0, currentTime - 10);
      player.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  }, [player, currentTime]);

  const handleForward = useCallback(() => {
    if (player) {
      const newTime = Math.min(duration, currentTime + 10);
      player.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  }, [player, currentTime, duration]);

  const handleEnd = () => {
    if (player) {
      player.seekTo(duration, true);
      setCurrentTime(duration);
    }
  };

  // Inside your component:
  usePlayerControls({
    player,
    handleRewind,
    handleForward,
    handleSplitGroup,
    handleGroupSelected,
    handlePlay,
  });

  const totalTimelineWidth = zoomLevel * innerWidth;
  const playheadAbsolute = duration
    ? (currentTime / duration) * totalTimelineWidth
    : 0;
  const playheadLeft = playheadAbsolute - timelineScroll;

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background">
      <Header
        saveDialogOpen={false} // You can pass your saveDialogOpen state and setter if needed.
        setSaveDialogOpen={() => {}}
      />

      <main className="flex-grow flex flex-col pl-1 gap-1 bg-card overflow-hidden">
        {/* Musical Groups Container - scrollable vertically */}
        <div
          className="relative overflow-auto no-scrollbar"
          style={{ height: "600px", width: `${containerWidthVW}vw` }}
        >
          {groups.map((group) => (
            <MusicalGroupComponent
              key={group.id}
              group={group}
              totalDuration={duration}
              selected={selectedGroupIds.includes(group.id)}
              onClick={toggleGroupSelection}
              onTextChange={handleTextChange}
              zoomLevel={zoomLevel}
            />
          ))}
        </div>

        {/* Timeline Container - Only scrollable horizontally */}
        <div
          ref={timelineRef}
          className="relative overflow-x-auto flex-none"
          style={{ width: `${containerWidthVW}vw`, height: "16px" }} // explicitly set timeline height
          onScroll={(e) => setTimelineScroll(e.currentTarget.scrollLeft)}
        >
          <Timeline
            zoomLevel={zoomLevel}
            duration={duration}
            onTimelineClick={handleTimelineClick}
            className=""
          />
          <div
            className="absolute top-0 h-4 w-1 bg-primary"
            style={{ left: playheadLeft }}
          />
        </div>
      </main>

      {/* Bottom Bar */}
      <footer className="border-t flex h-[40vh] bg-card">
        {/* Tools Section */}
        <div className="flex-none flex flex-col h-full p-4 overflow-y-auto border-r">
          <h2 className="text-lg font-semibold mb-2 text-foreground">Tools</h2>
          <div className="grid grid-cols-2 gap-3 flex-grow min-h-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="editor"
                    className="w-full flex-1 min-h-0"
                    onClick={() =>
                      setActiveSubMenu((prev) =>
                        prev === SubMenu.COLORS ? SubMenu.NONE : SubMenu.COLORS
                      )
                    }
                  >
                    Colors
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>C</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="editor"
                    className="w-full flex-1 min-h-0"
                    onClick={() =>
                      setActiveSubMenu((prev) =>
                        prev === SubMenu.SHAPES ? SubMenu.NONE : SubMenu.SHAPES
                      )
                    }
                  >
                    Shapes
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sh</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="editor"
                    className="w-full flex-1 min-h-0"
                    onClick={() => {
                      const updatedGroups = deleteGroup(
                        groups,
                        selectedGroupIds[0]
                      ).updatedGroups;
                      setGroups(updatedGroups);
                    }}
                  >
                    Delete Group
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>D</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="editor"
                    className="w-full flex-1 min-h-0"
                    onClick={handleSplitGroup}
                  >
                    Split Group
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>S</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="editor"
                    className="w-full flex-1 min-h-0"
                    onClick={handleGroupSelected}
                  >
                    Group Selected
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>G</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex-grow p-4 overflow-y-auto min-h-0 bg-background">
          {activeSubMenu === SubMenu.COLORS && (
            <ColorMenu onColorSelect={handleColorSelect} />
          )}
          {activeSubMenu === SubMenu.SHAPES && (
            <ShapeMenu onShapeSelect={handleShapeSelect} />
          )}
        </div>

        <div className="flex-none flex flex-col h-full p-4 border-l bg-background">
          <div className="h-full">
            {videoId ? (
              <YouTube
                videoId={videoId}
                opts={{
                  width: "100%",
                  height: "100%",
                  playerVars: {
                    autoplay: 0,
                    controls: 0,
                    rel: 0,
                    iv_load_policy: 3,
                    fs: 0,
                  },
                }}
                className="h-full w-full"
                onReady={onPlayerReady}
                onStateChange={onPlayerStateChange}
              />
            ) : (
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
                <Button type="submit" className="w-full" variant="default">
                  Load Video
                </Button>
              </form>
            )}
          </div>
          <MediaControls
            isPlaying={isPlaying}
            onBeginning={handleBeginning}
            onRewind={handleRewind}
            onPlay={handlePlay}
            onForward={handleForward}
            onEnd={handleEnd}
          />
        </div>
      </footer>
    </div>
  );
};

export default Home;
