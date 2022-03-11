import { Box, BoxProps } from "@chakra-ui/react";
import { useRef, useState } from "react";
import Image from "next/image";
import useMouse from "@react-hook/mouse-position";
import { CookieClick } from "./CookieClick";
import { BigNumber, ethers } from "ethers";

interface CookieProps extends BoxProps {
  cookiePerClick: BigNumber;
  pendingClicks: number;
  animateCpc: boolean;
  animateCookie: boolean;
}

export const Cookie: React.FC<CookieProps> = ({
  cookiePerClick,
  pendingClicks,
  animateCpc,
  animateCookie,
  onClick,
}) => {
  const ref = useRef(null);
  const mouse = useMouse(ref, {
    enterDelay: 100,
    leaveDelay: 100,
  });

  const allClicks = [];
  for (let i = 0; i < pendingClicks; i++) {
    allClicks.push(
      <CookieClick
        cookiePerClick={ethers.utils.formatUnits(cookiePerClick)}
        position="absolute"
        top={mouse.y as number}
        left={mouse.x as number}
        display={pendingClicks > 0 ? "block" : "none"}
        className={animateCpc ? "cookie-up" : ""}
      />,
    );
  }

  return (
    <Box
      onClick={onClick}
      my={3}
      _hover={{ transform: "scale(1.05)" }}
      transition="transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      className={animateCookie ? "cookie-pulse" : ""}
      ref={ref}
      position="relative"
    >
      <Image src="/assets/goldcookie.png" width={250} height={250} />
      {allClicks}
    </Box>
  );
};
