import { Box } from "@chakra-ui/react";
import { EditionMetadata } from "@thirdweb-dev/sdk";
import Image from "next/image";

interface LandProps {
  land: EditionMetadata;
  baker?: EditionMetadata;
}

export const Land: React.FC<LandProps> = ({ land, baker }) => {
  const metadata = baker?.metadata;

  return (
    <Box>
      <Image src={land.metadata.image as string} width={500} height={100} />
    </Box>
  );
};
