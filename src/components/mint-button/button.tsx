import { Button, Text, Flex } from "@chakra-ui/react";
import { useAddress, useSigner } from "@thirdweb-dev/react";

import { useMintMutation } from "../../hooks/useMintMutation";

interface MintButonProps {
  isLoading: boolean;
  isSoldOut: boolean;
}

export const MintButon: React.FC<MintButonProps> = ({
  isLoading,
  isSoldOut,
}) => {
  const address = useAddress();
  const signer = useSigner();

  const mintMutation = useMintMutation();

  return (
    <Button
      height="auto"
      py={4}
      bgGradient="linear(to-r, #FF9C40, #8944EA)"
      _hover={{
        bgGradient: "linear(to-l, #FF9C40, #8944EA)",
      }}
      _focus={{
        bgGradient: "linear(to-l, #FF9C40, #8944EA)",
      }}
      _active={{
        bgGradient: "linear(to-r, #FF9C40, #8944EA)",
      }}
      isDisabled={!signer || !address || isSoldOut}
      isLoading={isLoading || mintMutation.isLoading}
      size="lg"
      borderRadius="md"
      onClick={() => mintMutation.mutate()}
    >
      <Flex gap={1} flexDir="column">
        <Text fontSize="2xl">Mint NFT</Text>
        <Text fontSize="sm">{!isSoldOut ? "(for free!)" : "(sold out)"}</Text>
      </Flex>
    </Button>
  );
};
