import invariant from "tiny-invariant";
import { useAddress, useEditionDrop } from "@thirdweb-dev/react";
import { useMutation } from "react-query";
import { queryClient } from "../pages/_app";
import { useToast } from "@chakra-ui/react";
import { BigNumberish } from "ethers";
import { parseError } from "../utils/parseError";
import { useQueryWithNetwork } from "./useQueryWithNetwork";
import { characterKeys } from "../utils/cacheKeys";

interface EditionDropInput {
  tokenId: BigNumberish;
  quantity: BigNumberish;
}

export function useCharacterList(contractAddress?: string) {
  const editionDrop = useEditionDrop(contractAddress);
  return useQueryWithNetwork(
    characterKeys.list(contractAddress),
    () => editionDrop?.getAll(),
    {
      enabled: !!editionDrop && !!contractAddress,
    },
  );
}

export function useMintMutation(contractAddress?: string) {
  const address = useAddress();
  const editionDrop = useEditionDrop(contractAddress);

  const toast = useToast();

  return useMutation(
    (data: EditionDropInput) => {
      if (!address || !editionDrop) {
        throw new Error("No address or Edition Drop");
      }
      console.log({ address, editionDrop });
      return editionDrop.claim(data.tokenId, data.quantity);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries();
        toast({
          title: "Successfuly minted.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
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
