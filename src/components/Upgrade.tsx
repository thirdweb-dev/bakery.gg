import { Box, Tooltip } from "@chakra-ui/react";
import { EditionMetadata } from "@thirdweb-dev/sdk";
import Image from "next/image";
import { CONTRACT_ADDRESSES } from "../constants/addresses";
import {
  useEditionDropActiveClaimCondition,
  useMintMutation,
} from "../hooks/useEditionDropQueries";
import { ChainId } from "../utils/network";

interface UpgradeProps {
  upgrade: EditionMetadata;
}

export const Upgrade: React.FC<UpgradeProps> = ({ upgrade }) => {
  const mintUpgradeMutation = useMintMutation(
    CONTRACT_ADDRESSES[ChainId.Mumbai].upgrades,
  );

  const activeClaimPhase = useEditionDropActiveClaimCondition(
    CONTRACT_ADDRESSES[ChainId.Mumbai].upgrades,
    upgrade.metadata.id.toString(),
  );

  return (
    <Tooltip
      label={
        <>
          {upgrade.metadata.name}
          {activeClaimPhase.data?.currencyMetadata.displayValue}
        </>
      }
    >
      <Box
        onClick={() =>
          mintUpgradeMutation.mutate({
            tokenId: upgrade.metadata.id,
            quantity: 1,
          })
        }
        p={0}
      >
        <Image src={upgrade.metadata.image as string} width={72} height={72} />
      </Box>
    </Tooltip>
  );
};
