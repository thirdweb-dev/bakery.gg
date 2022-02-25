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
  useTokenBalance,
} from "../hooks/useEditionDropQueries";
import { Baker } from "../components/Baker";
import { Land } from "../components/Land";
import { useBakery } from "../hooks/useBakery";
import { BigNumber, ethers } from "ethers";
import NumberCounter from "react-smooth-number-counter";
import { CONTRACT_ADDRESSES } from "../constants/addresses";
import { useAddress, useSigner } from "@thirdweb-dev/react";
import { ChainId } from "../utils/network";
import { Card } from "../components/Card";
import { useActiveChainId } from "../hooks/useActiveChainId";
import { Upgrade } from "../components/Upgrade";

const GamePage = () => {
  const signerAddress = useAddress();
  const signer = useSigner();
  const chainId = useActiveChainId();
  const [score, setScore] = useState(BigNumber.from(0));
  const [blockNumber, setBlockNumber] = useState(0);
  const [isCookieMaxOut, setIsCookieBurned] = useState(false);
  const [mintQuantity, setMintQuantity] = useState(1);
  const {
    contract: bakeryContract,
    loading: bakeryLoading,
    maxNumberOfBlockReward,
    bakeStartBlock,
    cookiePerClick,
    cookiePerSecond,
    isBaking,
    refresh: bakeryRefresh,
  } = useBakery();
  const bakers = useEditionDropList(CONTRACT_ADDRESSES[ChainId.Mumbai].bakers);
  const lands = useEditionDropList(CONTRACT_ADDRESSES[ChainId.Mumbai].lands);
  const upgrades = useEditionDropList(
    CONTRACT_ADDRESSES[ChainId.Mumbai].upgrades,
  );
  const ownedBakers = useEditionDropOwned(
    CONTRACT_ADDRESSES[ChainId.Mumbai].bakers,
  );
  const ownedUpgrades = useEditionDropOwned(
    CONTRACT_ADDRESSES[ChainId.Mumbai].upgrades,
  );
  const balance = useTokenBalance(
    signerAddress || ethers.constants.AddressZero,
    CONTRACT_ADDRESSES[ChainId.Mumbai].cookies,
  );

  const [clickCount, setClickCount] = useState<number>(0);
  const [initBalance, setInitBalance] = useState(false);

  const ownedBakersIds = useMemo(
    () => ownedBakers?.data?.map((baker) => baker.metadata.id.toString()),
    [ownedBakers],
  );

  const ownedUpgradesIds = useMemo(
    () => ownedUpgrades?.data?.map((upgrade) => upgrade.metadata.id.toString()),
    [ownedUpgrades],
  );

  const onRebakeClick = useCallback(() => {
    if (signerAddress && clickCount) {
      fetch("/api/click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: signerAddress,
          amount: clickCount,
          startBlock: bakeStartBlock,
        }),
      })
        .then((r) => r.json())
        .then((response) =>
          bakeryContract?.rebake(response.payload, response.signature),
        )
        .then((tx) => tx?.wait())
        .then(() => {
          setClickCount(0);
          setScore(BigNumber.from(0));
          bakeryRefresh();
        });
    } else {
      bakeryContract
        ?.rebake(
          { to: ethers.constants.AddressZero, amount: 0, startBlock: 0 },
          "0x",
        )
        .then((tx) => tx?.wait())
        .then(() => {
          setScore(BigNumber.from(0));
          bakeryRefresh();
        });
    }
  }, [
    bakeryRefresh,
    bakeryContract,
    signerAddress,
    clickCount,
    bakeStartBlock,
  ]);

  const onCookieClick = useCallback(
    (_score) => {
      if (isBaking) {
        setClickCount(clickCount + 1);
        setScore(_score.add(cookiePerClick));
      }
    },
    [isBaking, clickCount, cookiePerClick],
  );

  const onCookieIncrement = useCallback(
    (value) => {
      if (isBaking && !isCookieMaxOut) {
        setScore(score.add(value));
      }
    },
    [isBaking, score, isCookieMaxOut],
  );

  useEffect(() => {
    if (signer?.provider) {
      signer.provider.getBlockNumber().then((bn) => {
        setBlockNumber(bn);
      });
    }
  }, [signer]);

  useEffect(() => {
    setInitBalance(false);
  }, [signerAddress, chainId]);

  useEffect(() => {
    async function update() {
      let estScore = BigNumber.from(0);
      if (isBaking && bakeStartBlock > 0) {
        const blocks = Math.min(
          maxNumberOfBlockReward,
          blockNumber - bakeStartBlock,
        );
        estScore = cookiePerSecond.mul(blocks);
        setIsCookieBurned(blocks === maxNumberOfBlockReward);
      }
      setScore(estScore);
      setInitBalance(true);
    }

    if (!initBalance && !bakeryLoading && blockNumber) {
      update();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber, bakeryLoading, onCookieIncrement]);

  useEffect(() => {
    if (!initBalance) {
      return;
    }
    const timeout = setInterval(() => {
      onCookieIncrement(cookiePerSecond.div(10));
    }, 100);
    return () => clearInterval(timeout);
  }, [initBalance, onCookieIncrement, cookiePerSecond]);

  return (
    <Flex
      p={4}
      color="black"
      justifyContent="center"
      background={
        "radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)"
      }
    >
      <SimpleGrid columns={3} gap={4}>
        <Card background="rgba(255, 255, 255, 0.5)" maxHeight="95vh">
          <Flex flexDir="column" textAlign="center">
            <ConnectWallet />
            <Box mt={1} w="full">
              {isBaking ? (
                <Button onClick={() => onRebakeClick()} w="full">
                  Serve
                </Button>
              ) : (
                <Button
                  w="full"
                  onClick={() =>
                    bakeryContract?.bake(ethers.constants.AddressZero, 0)
                  }
                >
                  Start Baking
                </Button>
              )}
              {isCookieMaxOut ? (
                <Text mt={3}>
                  Batch of cookies are ready to serve! Put in the next batch.
                </Text>
              ) : null}
            </Box>
            <Heading as="h3" size="xl" mt={5}>
              <Flex>
                <Image src="/assets/Chest.png" width="48" height="48" />
                <NumberCounter
                  value={Math.floor(
                    parseInt(
                      ethers.utils.formatUnits(
                        balance?.data?.value ?? BigNumber.from(0),
                      ),
                    ),
                  )}
                  transition={0}
                />
              </Flex>
            </Heading>
            <Heading as="h3" size="xl">
              <Flex>
                <Image src="/assets/Cooking.png" width="48" height="48" />
                <NumberCounter
                  value={Math.floor(parseInt(ethers.utils.formatUnits(score)))}
                  transition={0}
                />
              </Flex>
            </Heading>
            <Box onClick={() => onCookieClick(score)} my={3}>
              <Image src="/assets/goldcookie.png" width={250} height={250} />
            </Box>
            <Heading as="h5" size="lg">
              {ethers.utils.formatUnits(cookiePerSecond)} cookies per second
            </Heading>
            <Heading as="h5" size="lg">
              {ethers.utils.formatUnits(cookiePerClick)} cookies per click
            </Heading>
          </Flex>
        </Card>
        <Card
          background="rgba(255, 255, 255, 0.5)"
          maxHeight="95vh"
          overflowY="scroll"
        >
          <Flex flexGrow={1}>
            <Stack spacing={2} w="full">
              {lands?.data
                ?.filter((land) =>
                  ownedBakersIds?.includes(
                    (Number(land.metadata.id.toString()) + 1).toString(),
                  ),
                )
                ?.map((land) => (
                  <Land
                    key={land.metadata.id.toString()}
                    land={land}
                    baker={ownedBakers?.data?.find(
                      (baker) =>
                        (Number(land.metadata.id.toString()) + 1).toString() ===
                        baker.metadata.id.toString(),
                    )}
                  />
                ))}
            </Stack>
          </Flex>
        </Card>

        <Stack spacing={1} maxHeight="95vh">
          <Card background="rgba(255, 255, 255, 0.5)" overflowY="hidden">
            <SimpleGrid columns={6} spacing={1}>
              {upgrades.data
                ?.filter((upgrade) => {
                  const bakerId: string = upgrade?.metadata?.properties?.[
                    "Baker ID"
                  ] as string;
                  return ownedBakersIds?.includes(bakerId);
                })
                ?.filter(
                  (upgrade) =>
                    !ownedUpgradesIds?.includes(upgrade.metadata.id.toString()),
                )
                ?.map((upgrade) => (
                  <Upgrade
                    key={upgrade.metadata.id.toString()}
                    upgrade={upgrade}
                  />
                ))}
            </SimpleGrid>
          </Card>
          <Card p={0} background="rgba(255, 255, 255, 0.5)">
            <ButtonGroup isAttached size="lg" variant="outline" w="100%">
              <Button
                color="black"
                background="rgba(255, 255, 255, 0.5)"
                _hover={{
                  bg: "white",
                }}
                pointerEvents="none"
              >
                Mint quantity:
              </Button>
              <Button
                color="black"
                bg={mintQuantity === 1 ? "white" : "rgba(255, 255, 255, 0.5)"}
                _hover={{
                  bg: "white",
                }}
                onClick={() => setMintQuantity(1)}
                flexGrow={1}
              >
                1
              </Button>
              <Button
                color="black"
                bg={mintQuantity === 10 ? "white" : "rgba(255, 255, 255, 0.5)"}
                _hover={{
                  bg: "white",
                }}
                onClick={() => setMintQuantity(10)}
                flexGrow={1}
              >
                10
              </Button>
              <Button
                color="black"
                bg={mintQuantity === 100 ? "white" : "rgba(255, 255, 255, 0.5)"}
                _hover={{
                  bg: "white",
                }}
                onClick={() => setMintQuantity(100)}
                flexGrow={1}
              >
                100
              </Button>
            </ButtonGroup>
          </Card>
          <Card background="rgba(255, 255, 255, 0.5)" overflowY="scroll">
            <SimpleGrid spacing={1}>
              {bakers?.data?.map((baker) => (
                <Baker
                  key={baker.metadata.id.toString()}
                  balance={
                    ownedBakers?.data
                      ?.find(
                        (nft) =>
                          nft.metadata.id.toString() ===
                          baker.metadata.id.toString(),
                      )
                      ?.quantityOwned?.toString() ?? "0"
                  }
                  baker={baker}
                  mintQuantity={mintQuantity}
                />
              ))}
            </SimpleGrid>
          </Card>
        </Stack>
      </SimpleGrid>
    </Flex>
  );
};

export default GamePage;
