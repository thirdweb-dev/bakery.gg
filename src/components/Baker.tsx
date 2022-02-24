import { Flex, Box, Text } from "@chakra-ui/react";
import { EditionMetadata } from "@thirdweb-dev/sdk";
import Image from "next/image";
import { MouseEventHandler } from "react";
import { useEditionDropActiveClaimCondition } from "../hooks/useEditionDropQueries";

interface BakerProps {
  baker: EditionMetadata;
  mintQuantity: number;
  balance?: string;
  onClick: MouseEventHandler<HTMLDivElement>;
}

export const Baker: React.FC<BakerProps> = ({
  baker,
  balance,
  onClick,
  mintQuantity,
}) => {
  const activeClaimPhase = useEditionDropActiveClaimCondition(
    "0xaaC61B51873f226257725a49D68a28E38bbE3BA0",
    baker.metadata.id.toString(),
  );

  return (
    <Flex
      border="1px solid white"
      onClick={onClick}
      cursor="pointer"
      overflow="hidden"
    >
      <Box ml={-2} mb={-8}>
        <Image src={baker.metadata.image as string} width={60} height={60} />
      </Box>
      <Flex justifyContent="space-between" alignItems="center" w="100%" ml={2}>
        <Box>
          <Text fontSize={20}>{baker.metadata.name}</Text>
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
