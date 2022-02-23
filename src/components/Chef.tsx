import { Flex, Stack, Text } from "@chakra-ui/react";
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
    <Flex border="1px solid white" p={4} onClick={onClick} cursor="pointer">
      <Image src={chef.metadata.image as string} width={100} height={100} />
      <Flex justifyContent="space-between" alignItems="center" w="100%">
        <Stack ml={3} justifyContent="center">
          <Text fontSize={20}>{chef.metadata.name}</Text>
          <Text fontSize={20}>
            🍪{" "}
            {Math.floor(
              parseInt(
                activeClaimPhase.data?.currencyMetadata.displayValue as string,
              ) * mintQuantity,
            )}
          </Text>
        </Stack>
        <Text fontSize={40}>{balance}</Text>
      </Flex>
    </Flex>
  );
};
