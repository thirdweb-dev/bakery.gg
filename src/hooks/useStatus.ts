import { ethers } from "ethers";
import { useQuery } from "react-query";
import { Status } from "../interfaces";

export function useStatus(
  address?: string,
  pollInterval: number | false = false,
) {
  const provider = ethers.getDefaultProvider(process.env.NEXT_PUBLIC_RPC_URL);

  return useQuery<{ status: Status; minted: boolean; mintFailed: boolean }>(
    ["claim-status", { address }],
    async () => {
      const response = await fetch(`/api/status`, {
        method: "POST",
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to refresh status, ${response.status} ${response.statusText}`,
        );
      }

      const result: Status = await response.json();

      if (result.state === "SUCCESS" && result.txHash) {
        const receipt = await provider.getTransactionReceipt(result.txHash);
        if (receipt !== null) {
          return {
            status: result,
            mintFailed: receipt.status === 0,
            minted: receipt.status === 1,
          };
        }
      }

      return {
        status: result,
        minted: false,
        mintFailed: false,
      };
    },
    {
      refetchInterval: pollInterval
        ? () => Math.floor(Math.random() * (500 - 0 + 1) + 0) + pollInterval
        : false,
    },
  );
}
