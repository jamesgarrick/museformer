// File: src/hooks/usePlayerControls.ts
import { useEffect } from "react";
import YT from "react-youtube"; // or declare YT if not imported

interface PlayerControls {
  player: YT.Player | null;
  handleRewind: () => void;
  handleForward: () => void;
  handleSplitGroup: () => void;
  handleGroupSelected: () => void;
  handlePlay: () => void;
}

export function usePlayerControls({
  player,
  handleRewind,
  handleForward,
  handleSplitGroup,
  handleGroupSelected,
  handlePlay,
}: PlayerControls) {
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement;
      // Ignore if an input or textarea is focused.
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
            // Toggle play/pause.
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
          handleRewind();
        }
      } else if (e.key === "ArrowRight") {
        if (!active || active.tagName.toLowerCase() !== "iframe") {
          e.preventDefault();
          handleForward();
        }
      } else if (e.key.toLowerCase() === "s") {
        handleSplitGroup();
      } else if (e.key.toLowerCase() === "g") {
        handleGroupSelected();
      }
    };

    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("keydown", keyHandler);
    };
  }, [
    player,
    handleRewind,
    handleForward,
    handleSplitGroup,
    handleGroupSelected,
    handlePlay,
  ]);
}
