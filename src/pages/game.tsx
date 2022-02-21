import { Center } from "@chakra-ui/react";

import dynamic from "next/dynamic";

const GameCanvas = dynamic<any>(
  () => import("../components/games/GameCanvas").then((m) => m.GameCanvas),
  { ssr: false },
);

const GamePage = () => {
  return (
    <Center minH="100vh" as="main">
      <GameCanvas />
    </Center>
  );
};

export default GamePage;
