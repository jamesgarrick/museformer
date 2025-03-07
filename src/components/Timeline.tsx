import React from "react";

interface TimelineProps {
  duration: number;
  currentTime: number;
  onTimelineClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const Timeline: React.FC<TimelineProps> = ({
  duration,
  currentTime,
  onTimelineClick,
}) => {
  const progressWidth = duration ? (currentTime / duration) * 100 : 0;
  return (
    <div
      className="w-full h-4 bg-gray-300 cursor-pointer"
      onClick={onTimelineClick}
    >
      <div className="h-4 bg-blue-500" style={{ width: `${progressWidth}%` }} />
    </div>
  );
};

export default Timeline;
