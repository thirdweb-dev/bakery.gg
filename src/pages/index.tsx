import { Center, Container } from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";

import { ConnectWallet } from "../components/ConnectWallet";

const LandingPage = () => {
  const address = useAddress();

  return (
    <Center alignItems="flex-start" minH="100vh" as="main" py={8}>
      <Container maxW="container.xl" px={8}>
        <ConnectWallet />
      </Container>
    </Center>
  );
};

export default LandingPage;
