"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  PlayIcon,
  PauseIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/solid";

interface MediaControlsProps {
  isPlaying: boolean;
  onBeginning: () => void;
  onRewind: () => void;
  onPlay: () => void;
  onForward: () => void;
  onEnd: () => void;
}

const MediaControls: React.FC<MediaControlsProps> = ({
  isPlaying,
  onBeginning,
  onRewind,
  onPlay,
  onForward,
  onEnd,
}) => {
  return (
    <div className="mt-4 flex justify-end">
      <div className="flex space-x-2">
        <Button
          variant="outline"
          className="flex items-center"
          onClick={onBeginning}
        >
          <ChevronDoubleLeftIcon className="w-5 h-5 mr-1" />
          <span>Beginning</span>
        </Button>
        <Button
          variant="outline"
          className="flex items-center"
          onClick={onRewind}
        >
          <ArrowUturnLeftIcon className="w-5 h-5 mr-1" />
          <span>Rewind</span>
        </Button>
        <Button
          variant="outline"
          className="flex items-center"
          onClick={onPlay}
        >
          {isPlaying ? (
            <PauseIcon className="w-5 h-5" />
          ) : (
            <PlayIcon className="w-5 h-5" />
          )}
        </Button>
        <Button
          variant="outline"
          className="flex items-center"
          onClick={onForward}
        >
          <ArrowUturnRightIcon className="w-5 h-5 mr-1" />
          <span>Forward</span>
        </Button>
        <Button variant="outline" className="flex items-center" onClick={onEnd}>
          <ChevronDoubleRightIcon className="w-5 h-5 mr-1" />
          <span>End</span>
        </Button>
      </div>
    </div>
  );
};

export default MediaControls;
