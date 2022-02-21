import { Center } from "@chakra-ui/react";

import dynamic from "next/dynamic";

// eslint-disable-next-line
// @ts-ignore-next-line
const GameCanvas = dynamic(
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
