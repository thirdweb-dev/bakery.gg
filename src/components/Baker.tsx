import { Flex, Box, Text } from "@chakra-ui/react";
import { useSigner, useToken } from "@thirdweb-dev/react";
import { EditionMetadata } from "@thirdweb-dev/sdk";
import { BigNumber, ethers } from "ethers";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BakerMarket__factory } from "../../types/ethers-contracts";
import { CONTRACT_ADDRESSES } from "../constants/addresses";
import { useActiveChainId } from "../hooks/useActiveChainId";
import { useBakerMarketBuy } from "../hooks/useEditionDropQueries";
import { alchemyUrlMap, ChainId } from "../utils/network";
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
  const chainId = useActiveChainId();
  const [price, setPrice] = useState(BigNumber.from(0));
  const signer = useSigner();
  const market = BakerMarket__factory.connect(
    CONTRACT_ADDRESSES[chainId ?? ChainId.Mumbai].markets,
    signer || ethers.getDefaultProvider(alchemyUrlMap[ChainId.Mumbai]),
  );
  const mintBakerMutation = useBakerMarketBuy(
    CONTRACT_ADDRESSES[chainId ?? ChainId.Mumbai].markets,
    CONTRACT_ADDRESSES[chainId ?? ChainId.Mumbai].bakers,
  );
  const token = useToken(CONTRACT_ADDRESSES[chainId ?? ChainId.Mumbai].cookies);

  useEffect(() => {
    if (mintQuantity === 0) {
      return;
    }
    market
      .tokenBaseCost(baker.metadata.id)
      .then((cost) => {
        return market.price(cost, balance || 0, mintQuantity);
      })
      .then((p) => {
        setPrice(p);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance, mintQuantity, baker]);

  return (
    <Card
      p={1}
      background="rgba(255, 255, 255, 0.5)"
      _hover={{ bgColor: "white" }}
    >
      <Flex
        onClick={async () => {
          if (token) {
            const allowance = await token.allowance(market.address);
            if (allowance.lt(price)) {
              await token.setAllowance(
                market.address,
                ethers.constants.MaxUint256,
              );
            }
          }

          mintBakerMutation.mutate({
            tokenId: baker.metadata.id,
            quantity: mintQuantity,
          });
        }}
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
            <Text fontSize={16}>🍪 {ethers.utils.formatUnits(price)}</Text>
          </Box>
          <Text fontSize={40} mr={4}>
            {balance}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
};
