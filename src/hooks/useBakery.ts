import { useNetwork, useSigner } from "@thirdweb-dev/react";
import { useCallback, useMemo } from "react";
import { Bakery__factory } from "../../types/ethers-contracts";
import { ChainId } from "../utils/network";

const CONTRACT_ADDRESSES: Record<number, string> = {
  [ChainId.Mumbai]: "",
};

export function useBakery() {
  const signer = useSigner();
  const [network] = useNetwork();

  const contract = useMemo(() => {
    if (!network.data) {
      return null;
    }
    if (!signer.data) {
      return null;
    }
    const chainId = network.data.chain?.id || ChainId.Mumbai;
    return Bakery__factory.connect(CONTRACT_ADDRESSES[chainId], signer.data);
  }, [network, signer]);

  return {
    contract,
  };
}
