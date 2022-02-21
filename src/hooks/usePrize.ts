import { ThirdwebSDK } from "@3rdweb/sdk";
import { useQuery } from "react-query";
import { useStatus } from "./useStatus";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL as string;

export function usePrize(address?: string) {
  const sdk = new ThirdwebSDK(RPC_URL, {
    readOnlyRpcUrl: RPC_URL,
  });
  const module = sdk.getBundleModule(
    process.env.NEXT_PUBLIC_BUNDLE_COLLECTION_ADDRESS as string,
  );

  const statusQuery = useStatus(address);

  return useQuery(
    ["prize", { address }],
    async () => {
      const owned = await module.getOwned(address);
      return owned[0];
    },
    {
      enabled: !!address && statusQuery.data?.minted,
    },
  );
}
