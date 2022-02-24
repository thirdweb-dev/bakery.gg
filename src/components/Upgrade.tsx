import { EditionMetadata } from "@thirdweb-dev/sdk";
import Image from "next/image";
import { Card } from "./Card";

interface UpgradeProps {
  upgrade: EditionMetadata;
}

export const Upgrade: React.FC<UpgradeProps> = ({ upgrade }) => {
  return (
    <Card p={0} overflow="hidden" height={90}>
      <Image src={upgrade.metadata.image as string} width={500} height={100} />
    </Card>
  );
};
