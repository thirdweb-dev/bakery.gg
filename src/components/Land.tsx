import { Box } from "@chakra-ui/react";
import { EditionMetadata } from "@thirdweb-dev/sdk";
import Image from "next/image";
import { Card } from "./Card";

interface LandProps {
  land: EditionMetadata;
  baker?: EditionMetadata;
}

export const Land: React.FC<LandProps> = ({ land, baker }) => {
  const metadata = baker?.metadata;

  return (
    <Card p={0} overflow="hidden" height={90}>
      <Image src={land.metadata.image as string} width={500} height={100} />
    </Card>
  );
};
