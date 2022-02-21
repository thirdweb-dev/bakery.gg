import {
  AspectRatio,
  Center,
  Container,
  Divider,
  Flex,
  Heading,
  Image,
  LightMode,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";
import { BigNumber } from "ethers";
import { ConnectWalletButton } from "../components/connect-wallet/button";
import { Logo } from "../components/Logo";
import { MintButon } from "../components/mint-button/button";
import { useStatus } from "../hooks/useStatus";
import TweetEmbed from "react-tweet-embed";
import { LinkButton } from "../components/link-button";
import { SiEventbrite } from "react-icons/si";

const LandingPage = () => {
  const address = useAddress();
  const status = useStatus();

  const totalMinted = status.data?.status?.totalMinted || "000";
  const totalAvailable = status.data?.status?.totalAvailable || "000";
  const isSoldOut = BigNumber.from(totalMinted).gte(totalAvailable);

  return (
    <Center alignItems="flex-start" minH="100vh" as="main" py={8}>
      <Container maxW="container.xl" px={8}>
        bakery.gg
      </Container>
    </Center>
  );
};

export default LandingPage;
