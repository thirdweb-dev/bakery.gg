import { Center } from "@chakra-ui/react";

import dynamic from "next/dynamic";

// eslint-disable-next-line
// @ts-ignore-next-line
const GameCanvas = dynamic(() =>
  import("../components/GameCanvas").then((m) => m.GameCanvas),
);

const GamePage = () => {
  return (
    <Center minH="100vh" as="main">
      <GameCanvas />
    </Center>
  );
};

export default GamePage;
