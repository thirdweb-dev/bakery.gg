import { Box, Tooltip } from "@chakra-ui/react";
import { EditionMetadata } from "@thirdweb-dev/sdk";
import Image from "next/image";
import { CONTRACT_ADDRESSES } from "../constants/addresses";
import { useMintMutation } from "../hooks/useEditionDropQueries";
import { ChainId } from "../utils/network";

interface UpgradeProps {
  upgrade: EditionMetadata;
}

export const Upgrade: React.FC<UpgradeProps> = ({ upgrade }) => {
  const mintUpgradeMutation = useMintMutation(
    CONTRACT_ADDRESSES[ChainId.Mumbai].upgrades,
  );

  return (
    <Box
      onClick={() =>
        mintUpgradeMutation.mutate({
          tokenId: upgrade.metadata.id,
          quantity: 1,
        })
      }
      p={0}
    >
      <Tooltip label={upgrade.metadata.name}>
        <Image src={upgrade.metadata.image as string} width={72} height={72} />
      </Tooltip>
    </Box>
  );
};
