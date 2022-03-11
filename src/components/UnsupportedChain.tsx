import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  Icon,
  Stack,
  Text,
  HStack,
  Button,
} from "@chakra-ui/react";
import { useNetwork } from "@thirdweb-dev/react";
import { AiOutlineWarning } from "react-icons/ai";

const checkChainId =
  process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? 80001 : 137;

export const UnsupportedChain = () => {
  const [network, switchNetwork] = useNetwork();

  const showNetworkWarning = !!(
    network.data.chain &&
    network.data.chain?.id !== checkChainId &&
    !network.loading
  );

  return (
    <Drawer isOpen={showNetworkWarning} placement="bottom" onClose={() => null}>
      <DrawerOverlay backdropFilter="blur(5px)" />
      <DrawerContent borderTopRadius="3xl" color="#fff" bgColor="#111">
        <DrawerHeader color="#FFA6A6" as={HStack}>
          <Icon as={AiOutlineWarning} />
          <Text>Unsupported chain</Text>
        </DrawerHeader>

        <DrawerBody as={Stack} pb={8}>
          <Text mb={2} color="white">
            This dapp only works on the Polygon network, please switch networks
            in your connected wallet.
          </Text>
          {switchNetwork && (
            <Button
              variant="outline"
              colorScheme="gray"
              onClick={() => switchNetwork(checkChainId)}
            >
              Switch Network
            </Button>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
