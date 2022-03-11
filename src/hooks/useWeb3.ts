import {
  Avalanche,
  Ethereum,
  Fantom,
  Polygon,
} from "@thirdweb-dev/chain-icons";
import { BigNumber, ethers } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { useCallback } from "react";
import { useQuery } from "react-query";
import { useAddress, useNetwork } from "@thirdweb-dev/react";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { SUPPORTED_CHAIN_ID, alchemyUrlMap, ChainId } from "../utils/network";

interface NetworkMetadata {
  chainName: string;
  icon: React.ComponentType;
  symbol: string;
  isTestnet: boolean;
}

const defaultNetworkMetadata: Record<SUPPORTED_CHAIN_ID, NetworkMetadata> = {
  [ChainId.Polygon]: {
    chainName: "Polygon",
    icon: Polygon,
    symbol: "MATIC",
    isTestnet: false,
  },
  [ChainId.Mumbai]: {
    chainName: "Mumbai",
    icon: Polygon,
    symbol: "MATIC",
    isTestnet: true,
  },
};

const useBalance = (address?: string) => {
  const [network] = useNetwork();
  const chainId = network.data.chain?.id;
  return useQuery(
    ["balance", address, { chainId }],
    async () => {
      let balance = BigNumber.from(0);
      if (chainId) {
        const provider = ethers.getDefaultProvider(
          chainId in alchemyUrlMap
            ? alchemyUrlMap[chainId as SUPPORTED_CHAIN_ID]
            : chainId,
        );
        balance = await provider.getBalance(address || "");
      }

      balance = BigNumber.from(balance || 0);

      return {
        value: balance,
        formatted: formatEther(balance).slice(0, 6),
      };
    },
    {
      enabled: !!chainId && !!address,
    },
  );
};

export function useWeb3() {
  const address = useAddress();
  const [network] = useNetwork();
  const balance = useBalance(address);

  const getNetworkMetadata = useCallback(
    (chainId: SUPPORTED_CHAIN_ID) => {
      const cData: NetworkMetadata = {
        chainName: "Unsupported Chain",
        icon: AiOutlineQuestionCircle,
        isTestnet: false,
        symbol: "",
      };
      const c = network.data.chains.find((chain) => chain.id === chainId);

      if (chainId in defaultNetworkMetadata) {
        cData.chainName = defaultNetworkMetadata[chainId].chainName;
        cData.isTestnet = defaultNetworkMetadata[chainId].isTestnet;
        cData.symbol = defaultNetworkMetadata[chainId].symbol;
        cData.icon = defaultNetworkMetadata[chainId].icon;
      } else if (c) {
        cData.chainName = c.name;
        cData.isTestnet = !!c.testnet;
        cData.symbol = c.nativeCurrency?.symbol || "";
      }
      return cData;
    },
    [network],
  );

  return {
    getNetworkMetadata,
    // error: account.error,
    address,
    chainId: network.data.chain?.id,
    balance,
  };
}
