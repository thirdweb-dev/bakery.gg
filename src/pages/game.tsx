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
import { EditionMetadata } from "@thirdweb-dev/sdk";

const GamePage = () => {
  const [score, setScore] = useState(0);
  const [cps, setCps] = useState(0);
  const [cpc, setCpc] = useState(1);
  const [characters, setCharacters] = useState<EditionMetadata[]>([]);

  const mintMutation = useMintMutation(
    "0xaaC61B51873f226257725a49D68a28E38bbE3BA0",
  );

  const characterDrop = useEditionDrop(
    "0xaaC61B51873f226257725a49D68a28E38bbE3BA0",
  );

  useEffect(() => {
    const fetchData = async () => {
      const allCharacters = await characterDrop?.getAll();
      setCharacters(allCharacters as EditionMetadata[]);
      console.log(allCharacters);
    };
    fetchData();
  }, [cps, characterDrop]);

  useEffect(() => {
    const timeout = setInterval(() => setScore((s) => s + cps), 1000);
    return () => clearInterval(timeout);
  }, [cps]);

  return (
    <Flex pt={12} justifyContent="center">
      <Flex>
        <ConnectWallet />
        <Flex flexDir="column" textAlign="center">
          <Heading as="h3" size="2xl">
            {score} cookies
          </Heading>
          <Box onClick={() => setScore(score + cpc)} my={3}>
            <Image src="/assets/goldcookie.png" width={300} height={300} />
          </Box>
          <Heading as="h5" size="lg" onClick={() => setCps(cps + 1)}>
            {cps} cookies per second
          </Heading>
        </Flex>
        <Flex></Flex>
        <SimpleGrid mt={6} gap={12}>
          {characters?.map((character) => (
            <Flex
              key={character.metadata.id.toString()}
              border="1px solid white"
              p={4}
              borderRadius="2xl"
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
              <Stack ml={3} justifyContent="center">
                <Text>Name: {character.metadata.name}</Text>
                <Text>Cookies per second: {0.1}</Text>
                <Text>Cost: 100</Text>
              </Stack>
            </Flex>
          ))}
        </SimpleGrid>
      </Flex>
    </Flex>
  );
};

export default GamePage;
