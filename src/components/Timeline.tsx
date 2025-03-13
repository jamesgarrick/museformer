"use client";

import React from "react";
import { useEffect, useState } from "react";

interface TimelineProps {
  duration: number;
  zoomLevel: number;
  className: string | "";
  onTimelineClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const Timeline: React.FC<TimelineProps> = ({
  zoomLevel,
  onTimelineClick,
  className,
}) => {
  // Total timeline width in pixels.
  const [innerWidth, setInnerWidth] = useState(0);

  useEffect(() => {
    setInnerWidth(window.innerWidth);
  }, []);

  const totalWidth = zoomLevel * innerWidth;
  return (
    <div
      onClick={onTimelineClick}
      style={{ width: totalWidth }}
      className={`h-4 border bg-card cursor-pointer ${className}`}
    >
      {/* Timeline background (can be extended with markers or grid lines) */}
    </div>
  );
};

export default Timeline;
