import {
  Heading,
  Button,
  Icon,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  ButtonGroup,
} from "@chakra-ui/react";
import { useConnect } from "@thirdweb-dev/react";
import { BiWallet } from "react-icons/bi";
import { CoinbaseWallet } from "../icons/CoinbaseWallet";
import { MetaMask } from "../icons/MetaMask";
import { WalletConnect } from "../icons/WalletConnect";

const LogoMap = {
  injected: MetaMask,
  walletConnect: WalletConnect,
  walletLink: CoinbaseWallet,
};

interface ConnectWalletButtonProps {
  isLoading: boolean;
}

export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  isLoading,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [connectInfo, connect] = useConnect();
  return (
    <>
      <Button
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
        leftIcon={<BiWallet />}
        size="lg"
        borderRadius="md"
        onClick={onOpen}
        isLoading={isLoading}
      >
        Connect your wallet
      </Button>
      <Drawer
        placement="bottom"
        closeOnOverlayClick
        isOpen={isOpen}
        onClose={onClose}
      >
        <DrawerOverlay backdropFilter="blur(5px)" />
        <DrawerContent borderTopRadius="3xl" color="#fff" bgColor="#111">
          <DrawerCloseButton />
          <DrawerHeader color="#fff">
            <Heading size="sm">Connect Wallet</Heading>
          </DrawerHeader>

          <DrawerBody my={2}>
            <ButtonGroup
              variant="outline"
              colorScheme="gray"
              w="100%"
              flexDirection="column"
              gap={2}
              spacing={0}
            >
              {connectInfo.data.connectors
                .filter((c) => c.name.toLowerCase() !== "injected")
                .map((connector) => {
                  return (
                    <Button
                      key={connector.id}
                      leftIcon={
                        <Icon
                          as={LogoMap[connector.id as keyof typeof LogoMap]}
                          boxSize={7}
                        />
                      }
                      onClick={() => {
                        connect(connector).then(onClose);
                      }}
                    >
                      {connector.name}
                    </Button>
                  );
                })}
            </ButtonGroup>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
