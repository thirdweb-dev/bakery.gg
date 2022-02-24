import {
  Heading,
  Box,
  Flex,
  Stack,
  SimpleGrid,
  ButtonGroup,
  Button,
  Tooltip,
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
import { Land } from "../components/Land";
import { CONTRACT_ADDRESSES, useBakery } from "../hooks/useBakery";
import { BigNumber, ethers } from "ethers";
import NumberCounter from "react-smooth-number-counter";

const GamePage = () => {
  const [score, setScore] = useState(BigNumber.from(0));
  const [mintQuantity, setMintQuantity] = useState(1);
  const {
    contract: bakeryContract,
    cookiePerClick,
    cookiePerSecond,
    isBaking,
  } = useBakery();
  const bakers = useEditionDropList(CONTRACT_ADDRESSES[80001].bakers);
  const lands = useEditionDropList(CONTRACT_ADDRESSES[80001].lands);
  const upgrades = useEditionDropList(CONTRACT_ADDRESSES[80001].upgrades);
  const owned = useEditionDropOwned(CONTRACT_ADDRESSES[80001].bakers);
  const mintBakerMutation = useMintMutation(CONTRACT_ADDRESSES[80001].bakers);

  console.log(upgrades.data);

  const mintUpgradeMutation = useMintMutation(
    CONTRACT_ADDRESSES[80001].upgrades,
  );

  const ownedBakers = useMemo(
    () => owned?.data?.map((baker) => baker.metadata.id.toString()),
    [owned],
  );

  const onCookieClick = useCallback(
    (_score) => {
      if (isBaking) {
        setScore(_score.add(cookiePerClick));
      }
    },
    [isBaking, cookiePerClick],
  );

  const onCookieIncrement = useCallback(
    (value) => {
      if (isBaking) {
        setScore(score.add(value));
      }
    },
    [isBaking, score],
  );

  useEffect(() => {
    const timeout = setInterval(
      () => onCookieIncrement(cookiePerSecond.div(10)),
      100,
    );
    return () => clearInterval(timeout);
  }, [cookiePerSecond, onCookieIncrement]);

  return (
    <Flex pt={12} justifyContent="center">
      <SimpleGrid columns={3} gap={4}>
        <Flex flexDir="column" textAlign="center">
          <ConnectWallet />
          <Heading as="h3" size="2xl" mt={5}>
            <NumberCounter
              value={Math.floor(parseInt(ethers.utils.formatUnits(score)))}
              transition={0}
            />
            cookies
          </Heading>
          <Box onClick={() => onCookieClick(score)} my={3}>
            <Image src="/assets/goldcookie.png" width={250} height={250} />
          </Box>
          <Heading as="h5" size="lg">
            {ethers.utils.formatUnits(cookiePerSecond)} cookies per second
          </Heading>

          {isBaking ? (
            <Button
              onClick={() =>
                bakeryContract?.rebake(
                  {
                    to: ethers.constants.AddressZero,
                    amount: 0,
                    expiryTime: 0,
                    salt: 0,
                  },
                  "0x",
                )
              }
            >
              Unbake
            </Button>
          ) : (
            <Button
              onClick={() =>
                bakeryContract?.bake(ethers.constants.AddressZero, 0)
              }
            >
              Bake
            </Button>
          )}
        </Flex>
        <Flex flexGrow={1}>
          <Stack>
            {lands?.data
              ?.filter((land) =>
                ownedBakers?.includes(
                  (Number(land.metadata.id.toString()) + 1).toString(),
                ),
              )
              ?.map((land) => (
                <Land
                  key={land.metadata.id.toString()}
                  land={land}
                  baker={bakers?.data?.find(
                    (baker) =>
                      (Number(land.metadata.id.toString()) + 1).toString() ===
                      baker.metadata.id.toString(),
                  )}
                />
              ))}
          </Stack>
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
          <Stack>
            <SimpleGrid mt={6} columns={6}>
              {upgrades.data
                ?.filter((upgrade) => {
                  const bakerId: string = upgrade?.metadata?.properties?.[
                    "Baker ID"
                  ] as string;

                  return ownedBakers?.includes(bakerId);
                })
                ?.map((upgrade) => (
                  <Box
                    key={upgrade.metadata.id.toString()}
                    onClick={() =>
                      mintUpgradeMutation.mutate({
                        tokenId: upgrade.metadata.id,
                        quantity: 1,
                      })
                    }
                  >
                    <Tooltip label={upgrade.metadata.name}>
                      <Box boxSize={12}>
                        <Image
                          src={upgrade.metadata.image as string}
                          width={50}
                          height={50}
                        />
                      </Box>
                    </Tooltip>
                  </Box>
                ))}
            </SimpleGrid>

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
                    ?.quantityOwned.toString()}
                  onClick={() =>
                    mintBakerMutation.mutate({
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
        </Stack>
      </SimpleGrid>
    </Flex>
  );
};

export default GamePage;
