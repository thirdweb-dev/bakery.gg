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

interface PurchasedCharacter {
  id: string;
  quantity: number;
}

interface Character {
  id: string;
  name: string;
  cps: number;
  cost: number;
}

const characters: Character[] = [
  {
    id: "0",
    name: "Cookie",
    cps: 1,
    cost: 10,
  },
  {
    id: "1",
    name: "Cookie 2",
    cps: 10,
    cost: 100,
  },
];

const GamePage = () => {
  const [score, setScore] = useState(0);
  const [cps, setCps] = useState(0);
  const [incAmount, setIncAmount] = useState(1);
  const [purchasedUpgrades, setPurchasedUpgrades] = useState([]);
  const [purchasedCharacters, setPurchasedCharacters] = useState<
    PurchasedCharacter[]
  >([]);

  useEffect(() => {
    const timeout = setInterval(() => setScore((s) => s + cps), 1000);
    return () => clearInterval(timeout);
  }, [cps]);

  const buyCharacter = (character: Character) => {
    if (score >= character.cost) {
      setScore((s) => s - character.cost);
      setCps((c) => c + character.cps);
      setPurchasedCharacters((p) =>
        p.map((c) =>
          c.id === character.id ? { ...c, quantity: c.quantity + 1 } : c,
        ),
      );
      console.log(purchasedCharacters);
    }
  };

  return (
    <Flex pt={12} justifyContent="center">
      <Flex>
        <Flex flexDir="column" textAlign="center">
          <Heading as="h3" size="2xl" mb={3}>
            {score}
          </Heading>
          <Box onClick={() => setScore(score + incAmount)}>
            <Image src="/assets/goldcookie.png" width={300} height={300} />
          </Box>
        </Flex>
        <Flex>
          <Heading as="h3" size="2xl">
            {cps}
          </Heading>
          <Box onClick={() => setCps(cps + 1)}>
            <Image src="/assets/cps.png" width={300} height={300} />
          </Box>
        </Flex>
        <SimpleGrid mt={6} gap={12}>
          {characters.map((character) => (
            <Flex
              key={character.id}
              border="1px solid white"
              p={4}
              borderRadius="2xl"
              onClick={() => buyCharacter(character)}
              cursor="pointer"
            >
              <Image src="/assets/goldcookie.png" width={100} height={100} />
              <Stack ml={3} justifyContent="center">
                <Text>Name: {character.name}</Text>
                <Text>Cookies per second: {character.cps}</Text>
                <Text>Cost: {character.cost}</Text>
              </Stack>
            </Flex>
          ))}
        </SimpleGrid>
      </Flex>
    </Flex>
  );
};

export default GamePage;
