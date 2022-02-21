import { useRef } from "react";
import { useGame } from "../../hooks/useGame";
import gameConfig from "../../games";

export const GameCanvas = () => {
  const parentEl = useRef<HTMLDivElement>(null);
  useGame(gameConfig, parentEl);

  return <div ref={parentEl} />;
};
