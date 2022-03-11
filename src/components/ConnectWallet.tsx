import {
  Button,
  ButtonProps,
  Flex,
  Icon,
  Image,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  useClipboard,
} from "@chakra-ui/react";
import { useConnect, useDisconnect } from "@thirdweb-dev/react";
import React from "react";
import { AiOutlineDisconnect } from "react-icons/ai";
import { FiCheck, FiChevronDown } from "react-icons/fi";
import { ImCopy } from "react-icons/im";
import { useWeb3 } from "../hooks/useWeb3";
import { shortenIfAddress } from "../utils/address";

const connectorIdToImageUrl: Record<string, string> = {
  injected: "https://thirdweb.com/logos/metamask-fox.svg",
  walletConnect: "https://thirdweb.com/logos/walletconnect-logo.svg",
  walletLink: "https://thirdweb.com/logos/coinbase-wallet-logo.svg",
};
export const ConnectWallet: React.FC<ButtonProps> = (buttonProps) => {
  const [connector, connect] = useConnect();
  const { address, chainId, getNetworkMetadata } = useWeb3();
  const disconnect = useDisconnect();

  const { hasCopied, onCopy } = useClipboard(address || "");

  if (address && chainId) {
    const SVG = getNetworkMetadata(chainId).icon;
    return (
      <Menu matchWidth isLazy>
        <MenuButton
          as={Button}
          {...buttonProps}
          colorScheme="gray"
          variant="outline"
          rightIcon={<FiChevronDown />}
        >
          <Flex direction="row" gap={3} align="center">
            <Icon boxSize={6} as={SVG} />
            <Flex gap={0.5} direction="column" textAlign="left">
              <Text fontSize="sm" color="gray.500">
                {shortenIfAddress(address, true)} (
                {getNetworkMetadata(chainId).chainName})
              </Text>
            </Flex>
          </Flex>
        </MenuButton>
        <MenuList borderRadius="lg">
          <MenuItem
            closeOnSelect={false}
            icon={
              <Icon
                color={hasCopied ? "green.500" : undefined}
                as={hasCopied ? FiCheck : ImCopy}
              />
            }
            onClick={onCopy}
          >
            <Text size="label.md">Copy wallet address</Text>
          </MenuItem>
          <MenuDivider />
          <MenuItem icon={<AiOutlineDisconnect />} onClick={disconnect}>
            <Text size="label.md">Disconnect Wallet</Text>
          </MenuItem>
        </MenuList>
      </Menu>
    );
  }

  return (
    <Menu matchWidth isLazy>
      <MenuButton
        isLoading={connector.loading}
        as={Button}
        colorScheme="blue"
        rightIcon={<FiChevronDown />}
        {...buttonProps}
      >
        Connect Wallet
      </MenuButton>

      <MenuList>
        {connector.data.connectors.map((_connector) => (
          <MenuItem
            key={_connector.name}
            icon={
              <Image
                maxWidth={4}
                src={connectorIdToImageUrl[_connector.id]}
                alt=""
              />
            }
            onClick={() => connect(_connector)}
          >
            <Text fontSize="md">
              {_connector.name}
              {!_connector.ready ? " (unsupported)" : ""}
            </Text>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
