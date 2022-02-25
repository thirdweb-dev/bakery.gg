import { Box } from "@chakra-ui/react";
import { EditionMetadata } from "@thirdweb-dev/sdk";
import Image from "next/image";
import { Card } from "./Card";

interface LandProps {
  land: EditionMetadata;
  baker?: EditionMetadata;
}

export const Land: React.FC<LandProps> = ({ land, baker }) => {
  const allBakers = [];
  for (let i = 0; i < baker?.quantityOwned; i++) {
    allBakers.push(
      <Image
        key={i}
        src={baker?.metadata.image as string}
        width={24}
        height={24}
      />,
    );
  }

  return (
    <Card p={0} overflow="hidden" w="full">
      <Box bgImage={land.metadata.image as string} w="full" h={24}>
        {allBakers}
      </Box>
    </Card>
  );
};
