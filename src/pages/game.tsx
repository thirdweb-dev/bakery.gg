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
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ConnectWallet } from "../components/ConnectWallet";
import {
  useEditionDropList,
  useMintMutation,
} from "../hooks/useEditionDropQueries";

const GamePage = () => {
  const [score, setScore] = useState(0);
  const [mintQuantity, setMintQuantity] = useState(1);
  const [cps, setCps] = useState(0);
  const [cpc, setCpc] = useState(1);
  const chefs = useEditionDropList(
    "0xaaC61B51873f226257725a49D68a28E38bbE3BA0",
  );
  const lands = useEditionDropList(
    "0xa44000cb4fAD817b92A781CDF6A1A2ceb57D945b",
  );

  const mintMutation = useMintMutation(
    "0xaaC61B51873f226257725a49D68a28E38bbE3BA0",
  );

  useEffect(() => {
    const timeout = setInterval(() => setScore((s) => s + cps / 10), 100);
    return () => clearInterval(timeout);
  }, [cps]);

  return (
    <Flex pt={12} justifyContent="center">
      <SimpleGrid columns={3} gap={4}>
        <Flex flexDir="column" textAlign="center">
          <ConnectWallet />
          <Heading as="h3" size="2xl" mt={5}>
            {score} cookies
          </Heading>
          <Box onClick={() => setScore(score + cpc)} my={3}>
            <Image src="/assets/goldcookie.png" width={250} height={250} />
          </Box>
          <Heading as="h5" size="lg" onClick={() => setCps(cps + 1)}>
            {cps} cookies per second
          </Heading>
        </Flex>
        <Flex>
          <SimpleGrid>
            {lands?.data?.map((land) => (
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
            {chefs?.data?.map((chef) => (
              <Flex
                key={chef.metadata.id.toString()}
                border="1px solid white"
                p={4}
                onClick={() =>
                  mintMutation.mutate({
                    tokenId: chef.metadata.id,
                    quantity: mintQuantity,
                  })
                }
                cursor="pointer"
              >
                <Image
                  src={chef.metadata.image as string}
                  width={100}
                  height={100}
                />
                <Flex
                  justifyContent="space-between"
                  alignItems="center"
                  w="100%"
                >
                  <Stack ml={3} justifyContent="center">
                    <Text fontSize={20}>{chef.metadata.name}</Text>
                    <Text fontSize={20}>🍪 100</Text>
                  </Stack>
                  <Text fontSize={40}>12</Text>
                </Flex>
              </Flex>
            ))}
          </SimpleGrid>
        </Stack>
      </SimpleGrid>
    </Flex>
  );
};

export default GamePage;
