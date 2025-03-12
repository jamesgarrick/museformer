import React from "react";
import { Button } from "@/components/ui/button";

interface ColorButtonProps {
  color: string;
  label: string;
  onClick?: () => void;
}

export const ColorButton: React.FC<ColorButtonProps> = ({
  color,
  label,
  onClick,
}) => {
  return (
    <Button
      variant="outline"
      size="none" // a custom size variant in your button config that removes default padding/height
      onClick={onClick}
      // Force a 3:2 aspect ratio with a minimum width
      className="shrink-0 relative w-full min-w-[120px] aspect-[3/2] p-0 m-0 overflow-hidden items-stretch rounded-md"
    >
      {/* Top 2/3 color area */}
      <div style={{ flex: 2, backgroundColor: color }} className="flex-1" />
      {/* Bottom 1/3 label area */}
      <div className="absolute bottom-0 left-0 w-full h-1/4 bg-card flex items-center justify-center">
        <span className="text-foreground text-xs font-medium">{label}</span>
      </div>
    </Button>
  );
};
