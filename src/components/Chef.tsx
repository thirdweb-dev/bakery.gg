import { Flex, Box, Text } from "@chakra-ui/react";
import { EditionMetadata } from "@thirdweb-dev/sdk";
import Image from "next/image";
import { MouseEventHandler } from "react";
import { useEditionDropActiveClaimCondition } from "../hooks/useEditionDropQueries";

interface ChefProps {
  chef: EditionMetadata;
  mintQuantity: number;
  balance?: string;
  onClick: MouseEventHandler<HTMLDivElement>;
}

export const Chef: React.FC<ChefProps> = ({
  chef,
  balance,
  onClick,
  mintQuantity,
}) => {
  const activeClaimPhase = useEditionDropActiveClaimCondition(
    "0xaaC61B51873f226257725a49D68a28E38bbE3BA0",
    chef.metadata.id.toString(),
  );

  return (
    <Flex
      border="1px solid white"
      onClick={onClick}
      cursor="pointer"
      overflow="hidden"
      position="relative"
    >
      <Box position="absolute" left={-2} bottom={-2}>
        <Image src={chef.metadata.image as string} width={60} height={60} />
      </Box>
      <Flex justifyContent="space-between" alignItems="center" w="100%" ml={16}>
        <Box>
          <Text fontSize={20}>{chef.metadata.name}</Text>
          <Text fontSize={16}>
            🍪{" "}
            {Math.floor(
              parseInt(
                activeClaimPhase.data?.currencyMetadata.displayValue as string,
              ) * mintQuantity,
            )}
          </Text>
        </Box>
        <Text fontSize={40} mr={4}>
          {balance}
        </Text>
      </Flex>
    </Flex>
  );
};
