import { useAddress, useEditionDrop, useToken } from "@thirdweb-dev/react";
import { queryClient } from "../pages/_app";
import { useToast } from "@chakra-ui/react";
import { BigNumberish } from "ethers";
import { parseError } from "../utils/parseError";
import {
  useMutationWithInvalidate,
  useQueryWithNetwork,
} from "./useQueryWithNetwork";
import { editionDropKeys } from "../utils/cacheKeys";

interface EditionDropInput {
  tokenId: BigNumberish;
  quantity: BigNumberish;
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

export function useMintMutation(contractAddress?: string) {
  const address = useAddress();
  const editionDrop = useEditionDrop(contractAddress);

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
