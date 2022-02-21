import invariant from "tiny-invariant";
import { useAddress, useSigner } from "@thirdweb-dev/react";
import { useMutation } from "react-query";
import { queryClient } from "../pages/_app";

export function useMintMutation() {
  const address = useAddress();
  const signer = useSigner();

  return useMutation(
    async () => {
      invariant(signer.data, "useMintMutation: signer is not defined");
      invariant(address, "useMintMutation: address is not defined");

      const challengeResponse = await fetch("/api/challenge", {
        method: "POST",
        body: JSON.stringify({
          address,
        }),
      });
      if (!challengeResponse.ok) {
        throw new Error(
          `Fetching challenge failed: ${
            challengeResponse.status
          } - ${await challengeResponse.text()}`,
        );
      }
      const challenge = await challengeResponse.text();

      const sig = await signer.data.signMessage(challenge);

      const claimResponse = await fetch("/api/claim", {
        body: JSON.stringify({
          sig,
          address,
        }),
        method: "POST",
      });

      if (!claimResponse.ok) {
        throw new Error(
          `Fetching to post the claim: ${
            claimResponse.status
          } - ${await claimResponse.text()}`,
        );
      }
    },
    {
      onSuccess: () => {
        return queryClient.invalidateQueries(["claim-status"]);
      },
    },
  );
}
