import invariant from "tiny-invariant";
import { useAddress, useBundleDropModule } from "@thirdweb-dev/react";
import { useMutation } from "react-query";
import { queryClient } from "../pages/_app";
import { useToast } from "@chakra-ui/react";
import { BigNumberish } from "ethers";
import { parseError } from "../utils/parseError";

interface BundleDropMintMutation {
  tokenId: BigNumberish;
  quantity: BigNumberish;
}

export function useMintMutation() {
  const address = useAddress();
  const editionDrop = useBundleDropModule(
    "0xaaC61B51873f226257725a49D68a28E38bbE3BA0",
  );
  const toast = useToast();

  return useMutation(
    (data: BundleDropMintMutation) => {
      if (!address || !editionDrop) {
        throw new Error("No address or Edition Drop");
      }
      return editionDrop.claim(data.tokenId, data.quantity);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries();
        toast({
          title: "Successfuly claimed.",
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
