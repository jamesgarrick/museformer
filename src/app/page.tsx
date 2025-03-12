"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MusicalGroupComponent from "@/components/ui/MusicalGroupComponent";
import { MusicalGroup } from "@/interfaces/MusicalGroup";
import { useTheme } from "next-themes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
  MenubarContextSubmenu,
  MenubarShortcut,
} from "@/components/ui/menubar";
import Timeline from "@/components/Timeline";
import MediaControls from "@/components/MediaControls";
import { extractVideoId } from "@/utils/youtube";
import { splitGroupAtTime, groupSelectedGroups } from "@/utils/musicalGroups";
import { ColorButton } from "@/components/ui/ColorButton";
import { ShapeMenu } from "@/components/ui/ShapeMenu";

import AboutDialog from "@/components/About";
import { exportTimelineToJson } from "@/utils/exportTimeline";

// Extend your submenu enum:
enum SubMenu {
  NONE = "NONE",
  COLORS = "COLORS",
  SHAPES = "SHAPES",
}

type ColorMenuProps = {
  onColorSelect: (color: string) => void;
};

function ColorMenu({ onColorSelect }: ColorMenuProps) {
  const colors = [
    { color: "#FF0000", label: "Red" },
    { color: "#00FF00", label: "Green" },
    { color: "#0000FF", label: "Blue" },
    { color: "#FFA500", label: "Orange" },
    { color: "#FFFF00", label: "Yellow" },
    { color: "#800080", label: "Purple" },
    { color: "#00FFFF", label: "Cyan" },
    { color: "#FF00FF", label: "Magenta" },
    { color: "#008000", label: "Dark Green" },
    { color: "#FFC0CB", label: "Pink" },
    { color: "#A52A2A", label: "Brown" },
    { color: "#808080", label: "Gray" },
    { color: "#000000", label: "Black" },
    { color: "#FFFFFF", label: "White" },
    { color: "#FFD700", label: "Gold" },
    { color: "#C0C0C0", label: "Silver" },
    { color: "#4B0082", label: "Indigo" },
    { color: "#EE82EE", label: "Violet" },
    { color: "#008080", label: "Teal" },
    { color: "#800000", label: "Maroon" },
    { color: "#ADFF2F", label: "Green Yellow" },
    { color: "#FF4500", label: "Orange Red" },
    { color: "#DA70D6", label: "Orchid" },
    { color: "#F0E68C", label: "Khaki" },
    { color: "#B22222", label: "Firebrick" },
    { color: "#5F9EA0", label: "Cadet Blue" },
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {colors.map((c) => (
        <ColorButton
          key={c.label}
          color={c.color}
          label={c.label}
          onClick={() => onColorSelect(c.color)}
        />
      ))}
    </div>
  );
}

const Home = () => {
  const { setTheme } = useTheme();
  useEffect(() => {
    setTheme("system");
  }, []);

  // Zoom level as a reactive variable; 2 means 200vw, etc.
  const [zoomLevel, setZoomLevel] = useState(2);
  const containerWidthVW = zoomLevel * 100; // in vw units

  // Other state variables...
  const [timelineScroll, setTimelineScroll] = useState(0);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [groups, setGroups] = useState<MusicalGroup[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [innerWidth, setInnerWidth] = useState(0);

  // Submenu state
  const [activeSubMenu, setActiveSubMenu] = useState<SubMenu>(SubMenu.NONE);

  // header
  const [showAbout, setShowAbout] = useState(false);

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
      if (e.key === "=" || e.key === "+") setZoomLevel((prev) => prev + 0.25);
      else if (e.key === "-" || e.key === "_")
        setZoomLevel((prev) => Math.max(0.5, prev - 0.25));
    };
    window.addEventListener("keydown", handleZoom);
    return () => window.removeEventListener("keydown", handleZoom);
  }, []);

  const handleColorSelect = useCallback(
    (color: string) => {
      if (selectedGroupIds.length === 0) return;
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          selectedGroupIds.includes(group.id) ? { ...group, color } : group
        )
      );
    },
    [selectedGroupIds]
  );

  const handleShapeSelect = useCallback(
    (shape: string) => {
      if (selectedGroupIds.length === 0) return;
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          selectedGroupIds.includes(group.id) ? { ...group, shape } : group
        )
      );
    },
    [selectedGroupIds]
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
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, texts: { ...g.texts, [position]: newText } }
          : g
      )
    );
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

  const handleDeleteGroup = () => {
    if (selectedGroupIds.length !== 1) return;
    const idToDelete = selectedGroupIds[0];
    const groupToDelete = groups.find((g) => g.id === idToDelete);
    if (!groupToDelete) return;
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
    setGroups(newGroups);
    setSelectedGroupIds([]);
  };

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

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement;
      if (
        active &&
        (active.tagName === "INPUT" || active.tagName === "TEXTAREA")
      ) {
        return;
      }
      if (e.key === " " || e.code === "Space") {
        if (!active || active.tagName.toLowerCase() !== "iframe") {
          e.preventDefault();
          if (player) {
            const state = player.getPlayerState();
            if (state === 1) {
              player.pauseVideo();
            } else {
              player.playVideo();
            }
          }
        }
      } else if (e.key === "ArrowLeft") {
        if (!active || active.tagName.toLowerCase() !== "iframe") {
          e.preventDefault();
          if (player) handleRewind();
        }
      } else if (e.key === "ArrowRight") {
        if (!active || active.tagName.toLowerCase() !== "iframe") {
          e.preventDefault();
          if (player) handleForward();
        }
      } else if (e.key === "s" || e.key === "S") {
        handleSplitGroup();
      } else if (e.key === "g" || e.key === "G") {
        handleGroupSelected();
      }
    };

    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [
    player,
    handleRewind,
    handleForward,
    handleSplitGroup,
    handleGroupSelected,
  ]);

  const totalTimelineWidth = zoomLevel * innerWidth;
  const playheadAbsolute = duration
    ? (currentTime / duration) * totalTimelineWidth
    : 0;
  const playheadLeft = playheadAbsolute - timelineScroll;

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background">
      {/* Header */}
      <header className="bg-background h-8 w-fit flex items-center justify-center">
        <Menubar className="flex items-center justify-center border-none">
          <MenubarMenu>
            <MenubarTrigger className="font-bold text-foreground">
              Museformer
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => setShowAbout(true)}>
                About Museformer
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem className="disabled">Preferences...</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <AboutDialog open={showAbout} onOpenChange={setShowAbout} />

          <MenubarMenu>
            <MenubarTrigger className="text-foreground">File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem className="text-foreground disabled">
                New Project
              </MenubarItem>
              <MenubarItem className="text-foreground disabled">
                Open Project...
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem className="text-foreground disabled">
                Close
              </MenubarItem>
              <MenubarItem className="text-foreground disabled">
                Save
              </MenubarItem>
              <MenubarItem className="text-foreground disabled">
                Save As...
              </MenubarItem>

              <MenubarContextSubmenu trigger="Export">
                <MenubarItem
                  onClick={() => {
                    const jsonTimeline = exportTimelineToJson(groups);
                    navigator.clipboard
                      .writeText(jsonTimeline)
                      .then(() => {
                        alert("Timeline JSON copied to clipboard.");
                      })
                      .catch(() => {
                        alert("Failed to copy timeline JSON.");
                      });
                  }}
                >
                  Share Link
                </MenubarItem>
              </MenubarContextSubmenu>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className="text-foreground">Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem className="disabled">
                Undo <MenubarShortcut className="px-4">ctrl+z</MenubarShortcut>
              </MenubarItem>
              <MenubarItem className="disabled">
                Redo <MenubarShortcut className="px-4">ctrl+r</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem className="disabled">Cut</MenubarItem>
              <MenubarItem className="disabled">Copy</MenubarItem>
              <MenubarItem className="disabled">Paste</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className="text-foreground">Help</MenubarTrigger>
            <MenubarContent>
              <MenubarItem className="disabled">Online Handbook</MenubarItem>
              <MenubarSeparator />
              <MenubarItem className="disabled">View Logs</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className="text-foreground">View</MenubarTrigger>
            <MenubarContent>
              <MenubarItem
                onSelect={() => {
                  setTheme("light");
                }}
              >
                Light
              </MenubarItem>
              <MenubarItem
                onSelect={() => {
                  setTheme("dark");
                }}
              >
                Dark
              </MenubarItem>
              <MenubarItem
                onSelect={() => {
                  setTheme("system");
                }}
              >
                System
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </header>

      {/* Timeline Section */}
      <main className="flex-grow flex flex-col pl-1 gap-1 bg-card">
        <div className="relative shadow overflow-x-auto overflow-y-hidden flex flex-col flex-grow no-scrollbar">
          <div className="flex-grow" style={{ width: `${containerWidthVW}vw` }}>
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
          <div
            ref={timelineRef}
            className="relative overflow-x-auto"
            style={{ width: `${containerWidthVW}vw`, height: "1rem" }}
            onScroll={(e) => setTimelineScroll(e.currentTarget.scrollLeft)}
          >
            <Timeline
              zoomLevel={zoomLevel}
              duration={duration}
              onTimelineClick={handleTimelineClick}
            />
            <div
              className="absolute top-0 h-4 w-1 bg-primary"
              style={{ left: playheadLeft }}
            />
          </div>
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
                    onClick={handleDeleteGroup}
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
