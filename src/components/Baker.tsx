import { Flex, Box, Text } from "@chakra-ui/react";
import { EditionMetadata } from "@thirdweb-dev/sdk";
import Image from "next/image";
import { CONTRACT_ADDRESSES } from "../constants/addresses";
import {
  useEditionDropActiveClaimCondition,
  useMintMutation,
} from "../hooks/useEditionDropQueries";
import { ChainId } from "../utils/network";
import { Card } from "./Card";

interface BakerProps {
  baker: EditionMetadata;
  mintQuantity: number;
  balance?: string;
}

export const Baker: React.FC<BakerProps> = ({
  baker,
  balance,
  mintQuantity,
}) => {
  const activeClaimPhase = useEditionDropActiveClaimCondition(
    CONTRACT_ADDRESSES[ChainId.Mumbai].bakers,
    baker.metadata.id.toString(),
  );

  const mintBakerMutation = useMintMutation(
    CONTRACT_ADDRESSES[ChainId.Mumbai].bakers,
  );

  return (
    <Card
      p={1}
      background="rgba(255, 255, 255, 0.5)"
      _hover={{ bgColor: "white" }}
    >
      <Flex
        onClick={() =>
          mintBakerMutation.mutate({
            tokenId: baker.metadata.id,
            quantity: mintQuantity,
          })
        }
        cursor="pointer"
        overflow="hidden"
      >
        <Box>
          <Image src={baker.metadata.image as string} width={60} height={60} />
        </Box>
        <Flex
          justifyContent="space-between"
          alignItems="center"
          w="100%"
          ml={2}
        >
          <Box>
            <Text fontSize={20}>{baker.metadata.name}</Text>
            <Text fontSize={16}>
              🍪{" "}
              {Math.floor(
                parseInt(
                  activeClaimPhase.data?.currencyMetadata
                    .displayValue as string,
                ) * mintQuantity,
              )}
            </Text>
          </Box>
          <Text fontSize={40} mr={4}>
            {balance}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
};
