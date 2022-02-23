import {
  Heading,
  Box,
  Flex,
  Text,
  Stack,
  SimpleGrid,
  ButtonGroup,
  Button,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ConnectWallet } from "../components/ConnectWallet";
import {
  useEditionDropList,
  useEditionDropOwned,
  useMintMutation,
} from "../hooks/useEditionDropQueries";
import { Baker } from "../components/Baker";
import { useBakery } from "../hooks/useBakery";
import { BigNumber, ethers } from "ethers";

const GamePage = () => {
  const [score, setScore] = useState(BigNumber.from(0));
  const [mintQuantity, setMintQuantity] = useState(1);
  const { cookiePerClick, cookiePerSecond } = useBakery();
  const bakers = useEditionDropList(
    "0xaaC61B51873f226257725a49D68a28E38bbE3BA0",
  );
  const owned = useEditionDropOwned(
    "0xaaC61B51873f226257725a49D68a28E38bbE3BA0",
  );

  const ownedBakers = useMemo(
    () => owned?.data?.map((baker) => baker.metadata.id.toString()),
    [owned],
  );

  const lands = useEditionDropList(
    "0xa44000cb4fAD817b92A781CDF6A1A2ceb57D945b",
  );

  const mintMutation = useMintMutation(
    "0xaaC61B51873f226257725a49D68a28E38bbE3BA0",
  );

  const onCookieClick = useCallback(
    (_score) => {
      setScore(_score.add(cookiePerClick));
    },
    [cookiePerClick],
  );

  const onCookieIncrement = useCallback(
    (value) => {
      setScore(score.add(value));
    },
    [score],
  );

  useEffect(() => {
    const timeout = setInterval(() => onCookieIncrement(cookiePerSecond), 1000);
    return () => clearInterval(timeout);
  }, [cookiePerSecond, onCookieIncrement]);

  return (
    <Flex pt={12} justifyContent="center">
      <SimpleGrid columns={3} gap={4}>
        <Flex flexDir="column" textAlign="center">
          <ConnectWallet />
          <Heading as="h3" size="2xl" mt={5}>
            {ethers.utils.formatUnits(score)} cookies
          </Heading>
          <Box onClick={() => onCookieClick(score)} my={3}>
            <Image src="/assets/goldcookie.png" width={250} height={250} />
          </Box>
          <Heading as="h5" size="lg">
            {ethers.utils.formatUnits(cookiePerSecond)} cookies per second
          </Heading>
        </Flex>
        <Flex flexGrow={1}>
          <SimpleGrid>
            {lands?.data
              ?.filter((land) =>
                ownedBakers?.includes(
                  (Number(land.metadata.id.toString()) + 1).toString(),
                ),
              )
              ?.map((land) => (
                <Box key={land.metadata.id.toString()}>
                  <Image
                    src={land.metadata.image as string}
                    width={500}
                    height={100}
                  />
                </Box>
              ))}
          </SimpleGrid>
        </Flex>

        <Stack>
          <ButtonGroup isAttached size="md" variant="outline">
            <Button
              color="black"
              bg="white"
              _hover={{
                bg: "gray.200",
              }}
              pointerEvents="none"
            >
              Mint quantity:
            </Button>
            <Button
              color="black"
              bg={mintQuantity === 1 ? "gray.200" : "white"}
              _hover={{
                bg: "gray.200",
              }}
              onClick={() => setMintQuantity(1)}
            >
              1
            </Button>
            <Button
              color="black"
              bg={mintQuantity === 10 ? "gray.200" : "white"}
              _hover={{
                bg: "gray.200",
              }}
              onClick={() => setMintQuantity(10)}
            >
              10
            </Button>
            <Button
              color="black"
              bg={mintQuantity === 100 ? "gray.200" : "white"}
              _hover={{
                bg: "gray.200",
              }}
              onClick={() => setMintQuantity(100)}
            >
              100
            </Button>
          </ButtonGroup>
          <SimpleGrid mt={6}>
            {bakers?.data?.map((baker) => (
              <Baker
                key={baker.metadata.id.toString()}
                balance={owned?.data
                  ?.find(
                    (nft) =>
                      nft.metadata.id.toString() ===
                      baker.metadata.id.toString(),
                  )
                  ?.supply.toString()}
                onClick={() =>
                  mintMutation.mutate({
                    tokenId: baker.metadata.id,
                    quantity: mintQuantity,
                  })
                }
                baker={baker}
                mintQuantity={mintQuantity}
              />
            ))}
          </SimpleGrid>
        </Stack>
      </SimpleGrid>
    </Flex>
  );
};

export default GamePage;
