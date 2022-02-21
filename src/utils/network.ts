export enum ChainId {
  Mainnet = 1,
  Ropsten = 3,
  Rinkeby = 4,
  Goerli = 5,
  Kovan = 42,
  BSC = 56,
  xDai = 100,
  Polygon = 137,
  Moonriver = 1285,
  Mumbai = 80001,
  Harmony = 1666600000,
  Localhost = 1337,
  Hardhat = 31337,
  Fantom = 250,
  FantomTestnet = 4002,
  Avalanche = 43114,
  AvalancheFujiTestnet = 43113,
}

export const alchemyUrlMap: Record<SUPPORTED_CHAIN_ID, string> = {
  [ChainId.Polygon]: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
  [ChainId.Mumbai]: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
};

export type SUPPORTED_CHAIN_ID = ChainId.Mumbai | ChainId.Polygon;

export const SUPPORTED_CHAIN_IDS: SUPPORTED_CHAIN_ID[] = [
  /*   ChainId.Polygon, */
  ChainId.Mumbai,
];

export const SupportedChainIdToNetworkMap: Record<SUPPORTED_CHAIN_ID, string> =
  {
    [ChainId.Polygon]: "polygon",
    [ChainId.Mumbai]: "mumbai",
  } as const;

export type ValueOf<T> = T[keyof T];

export const SupportedNetworkToChainIdMap: Record<
  ValueOf<typeof SupportedChainIdToNetworkMap>,
  SUPPORTED_CHAIN_ID
> = {
  /*   polygon: ChainId.Polygon, */
  mumbai: ChainId.Mumbai,
} as const;

export type SupportedNetwork = keyof typeof SupportedNetworkToChainIdMap;

export function getChainIdFromNetwork(
  network?: SupportedNetwork,
): SUPPORTED_CHAIN_ID | undefined {
  if (!network || !SupportedNetworkToChainIdMap[network]) {
    return undefined;
  }

  return SupportedNetworkToChainIdMap[network];
}

export function isSupportedNetwork(network?: string): boolean {
  return network ? network in SupportedNetworkToChainIdMap : false;
}

export function getNetworkFromChainId<T extends SUPPORTED_CHAIN_ID>(
  chainId: T,
): SupportedNetwork {
  return SupportedChainIdToNetworkMap[chainId] || "";
}
