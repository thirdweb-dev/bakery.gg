import {
  Container,
  Heading,
  Box,
  Flex,
  Text,
  Stack,
  SimpleGrid,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ConnectWallet } from "../components/ConnectWallet";
import { useEditionDrop } from "@thirdweb-dev/react";
import {
  useCharacterList,
  useMintMutation,
} from "../hooks/useEditionDropQueries";

const GamePage = () => {
  const [score, setScore] = useState(0);
  const [cps, setCps] = useState(0);
  const [cpc, setCpc] = useState(1);
  const characters = useCharacterList(
    "0xaaC61B51873f226257725a49D68a28E38bbE3BA0",
  );
  const mintMutation = useMintMutation(
    "0xaaC61B51873f226257725a49D68a28E38bbE3BA0",
  );

  useEffect(() => {
    const timeout = setInterval(() => setScore((s) => s + cps), 1000);
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
        <Flex>hello</Flex>
        <SimpleGrid mt={6}>
          {characters?.data?.map((character) => (
            <Flex
              key={character.metadata.id.toString()}
              border="1px solid white"
              p={4}
              onClick={() =>
                mintMutation.mutate({
                  tokenId: character.metadata.id,
                  quantity: 1,
                })
              }
              cursor="pointer"
            >
              <Image
                src={character.metadata.image as string}
                width={100}
                height={100}
              />
              <Flex justifyContent="space-between" alignItems="center" w="100%">
                <Stack ml={3} justifyContent="center">
                  <Text fontSize={20}>{character.metadata.name}</Text>
                  <Text fontSize={20}>🍪 100</Text>
                </Stack>
                <Text fontSize={40}>12</Text>
              </Flex>
            </Flex>
          ))}
        </SimpleGrid>
      </SimpleGrid>
    </Flex>
  );
};

export default GamePage;
