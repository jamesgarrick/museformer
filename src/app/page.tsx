"use client";
import React, { useState, useRef, useEffect } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MusicalGroupComponent from "@/components/ui/MusicalGroupComponent";
import { MusicalGroup } from "@/interfaces/MusicalGroup";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import Timeline from "@/components/Timeline";
import MediaControls from "@/components/MediaControls";
import { extractVideoId } from "@/utils/youtube";
import { splitGroupAtTime, groupSelectedGroups } from "@/utils/musicalGroups";

const Home = () => {
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
    const state = event.data;
    // 1: playing, 2: paused
    setIsPlaying(state === 1);
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

  const toggleGroupSelection = (id: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id]
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

  // --- Media Control Handlers ---
  const handleBeginning = () => {
    if (player) {
      player.seekTo(0, true);
      setCurrentTime(0);
    }
  };

  const handleRewind = () => {
    if (player) {
      const newTime = Math.max(0, currentTime - 10);
      player.seekTo(newTime, true);
      setCurrentTime(newTime);
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

  const handleForward = () => {
    if (player) {
      const newTime = Math.min(duration, currentTime + 10);
      player.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  const handleEnd = () => {
    if (player) {
      player.seekTo(duration, true);
      setCurrentTime(duration);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-200 flex flex-col">
      {/* Header */}
      <header className="bg-gray-200 p-4">
        <h1 className="text-2xl font-bold">Museformer</h1>
      </header>

      {/* Timeline Section */}
      <main className="flex-grow flex flex-col gap-1">
        <div className="relative bg-gray-300 shadow overflow-y-hidden overflow-x-scroll flex-grow pb-4">
          {groups.map((group) => (
            <MusicalGroupComponent
              key={group.id}
              group={group}
              totalDuration={duration}
              selected={selectedGroupIds.includes(group.id)}
              onClick={toggleGroupSelection}
              onTextChange={handleTextChange}
            />
          ))}
        </div>
        <div ref={timelineRef}>
          <Timeline
            duration={duration}
            currentTime={currentTime}
            onTimelineClick={handleTimelineClick}
          />
        </div>
      </main>

      {/* Bottom Bar */}
      <footer className="border-t flex h-[40vh] bg-gray-100">
        {/* Tools Section */}
        <div className="flex-none flex flex-col h-full p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2">Tools</h2>
          <div className="grid grid-cols-2 gap-3 flex-grow min-h-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="w-full flex-1 min-h-0">
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
                    variant="outline"
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
                    variant="outline"
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
                    variant="outline"
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
            <Button
              variant="outline"
              className="w-full flex-1 min-h-0"
              disabled
            >
              Shapes
            </Button>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-grow"></div>

        {/* Video & Media Controls Section */}
        <div className="flex-none flex flex-col h-full p-4">
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
                <Button type="submit" className="w-full">
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
