import {
  useAddress,
  useEditionDrop,
  useSigner,
  useToken,
} from "@thirdweb-dev/react";
import { useToast } from "@chakra-ui/react";
import { BigNumber, BigNumberish, Signer } from "ethers";
import { parseError } from "../utils/parseError";
import {
  useMutationWithInvalidate,
  useQueryWithNetwork,
} from "./useQueryWithNetwork";
import { useBakery } from "./useBakery";
import { BakerMarket__factory } from "../../types/ethers-contracts";
import { bakeryKeys, editionDropKeys, tokenKeys } from "../utils/cacheKeys";

interface EditionDropInput {
  tokenId: BigNumberish;
  quantity: BigNumberish;
}

export function useTokenBalance(address: string, contractAddress?: string) {
  const token = useToken(contractAddress);

  return useQueryWithNetwork(
    tokenKeys.balanceOf(contractAddress, address),
    () => token?.balanceOf(address),
    {
      enabled: !!token && !!contractAddress && !!address,
    },
  );
}

export function useCookiePerSecond(address: string, contractAddress?: string) {
  const { contract } = useBakery();

  return useQueryWithNetwork(
    bakeryKeys.cookiePerSecond(contractAddress, address),
    async () => {
      const reward = (await contract?.totalReward(address, 1)) ?? 1;
      return BigNumber.from(reward);
    },
    {
      enabled: !!contract && !!contractAddress && !!address,
    },
  );
}

export function useBakeStartBlock(address: string, contractAddress?: string) {
  const { contract } = useBakery();

  return useQueryWithNetwork(
    bakeryKeys.bakeStartBlock(contractAddress, address),
    async () => {
      const oven = await contract?.ovens(address);
      return BigNumber.from(oven?.startBlock ?? 0).toNumber();
    },
    {
      enabled: !!contract && !!contractAddress && !!address,
    },
  );
}

export function useCookiePerClick(address: string, contractAddress?: string) {
  const { contract } = useBakery();

  return useQueryWithNetwork(
    bakeryKeys.cookiePerClick(contractAddress, address),
    async () => {
      const rps = (await contract?.rewardPerSpice(address)) ?? 1;
      const boost = (await contract?.spiceBoost(address)) ?? 1;
      return BigNumber.from(rps).mul(boost);
    },
    {
      enabled: !!contract && !!contractAddress && !!address,
    },
  );
}

export function useEditionDropList(contractAddress?: string) {
  const editionDrop = useEditionDrop(contractAddress);

  return useQueryWithNetwork(
    editionDropKeys.list(contractAddress),
    () => editionDrop?.getAll(),
    {
      enabled: !!editionDrop && !!contractAddress,
    },
  );
}

export function useEditionDropOwned(contractAddress?: string) {
  const editionDrop = useEditionDrop(contractAddress);
  const address = useAddress();
  return useQueryWithNetwork(
    editionDropKeys.owned(contractAddress),
    async () => {
      return await editionDrop?.getOwned(address || "");
    },
    {
      enabled: !!editionDrop && !!contractAddress && !!address,
    },
  );
}

export function useEditionDropActiveClaimCondition(
  contractAddress?: string,
  tokenId?: string,
) {
  const editionDrop = useEditionDrop(contractAddress);
  return useQueryWithNetwork(
    editionDropKeys.activeClaimCondition(contractAddress, tokenId),
    async () => {
      return await editionDrop?.claimConditions.getActive(tokenId as string);
    },
    {
      enabled: !!editionDrop && !!contractAddress && tokenId !== undefined,
    },
  );
}

export function useBakeryRefreshMutation() {
  const { refresh } = useBakery();
  return useMutationWithInvalidate(
    async () => {
      return await refresh();
    },
    {
      onSuccess: (_data, _variables, _options, invalidate) => {
        return invalidate([bakeryKeys.all]);
      },
    },
  );
}

export function useBakerMarketBuy(
  contractAddress: string,
  bakerAddress: string,
) {
  const address = useAddress();
  const signer = useSigner();
  const market = BakerMarket__factory.connect(
    contractAddress,
    signer as Signer,
  );
  const { refresh } = useBakery();

  const toast = useToast();

  return useMutationWithInvalidate(
    async (data: EditionDropInput) => {
      if (!address || !signer || !market) {
        throw new Error("No address or Edition Drop");
      }
      const tx = await market.buy(data.tokenId, data.quantity);
      return await tx.wait();
    },
    {
      onSuccess: (_data, _variables, _options, invalidate) => {
        toast({
          title: "Successfuly minted.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        refresh();
        return invalidate([
          bakeryKeys.all,
          editionDropKeys.list(bakerAddress),
          editionDropKeys.detail(bakerAddress),
          editionDropKeys.list(contractAddress),
          editionDropKeys.detail(contractAddress),
        ]);
      },
      onError: (err) => {
        toast({
          title: "Minting failed",
          description: parseError(err),
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      },
    },
  );
}

export function useMintMutation(contractAddress?: string) {
  const address = useAddress();
  const editionDrop = useEditionDrop(contractAddress);
  const { refresh } = useBakery();

  const toast = useToast();

  return useMutationWithInvalidate(
    (data: EditionDropInput) => {
      if (!address || !editionDrop) {
        throw new Error("No address or Edition Drop");
      }
      return editionDrop.claim(data.tokenId, data.quantity);
    },
    {
      onSuccess: (_data, _variables, _options, invalidate) => {
        toast({
          title: "Successfuly minted.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        refresh();
        return invalidate([
          editionDropKeys.list(contractAddress),
          editionDropKeys.detail(contractAddress),
        ]);
      },
      onError: (err) => {
        toast({
          title: "Minting failed",
          description: parseError(err),
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      },
    },
  );
}
