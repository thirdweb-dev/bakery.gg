import { Center, Container, Heading, VStack } from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";

import { ConnectWallet } from "../components/ConnectWallet";
import Image from "next/image";

const LandingPage = () => {
  const address = useAddress();

  return (
    <Center alignItems="flex-start" maxH="100vh" as="main" py={8}>
      <Container maxW="container.xl" px={8}>
        {/*         <ConnectWallet /> */}

        <Center as={VStack}>
          <Heading as="h1" size="2xl" mb={4} textAlign="center">
            Welcome to The Bakery
          </Heading>
          <Heading
            as="h3"
            size="md"
            mb={4}
            bgGradient="linear(to-b, #88FFEA, #E038BB)"
            bgClip="text"
          >
            Coming Soon
          </Heading>
          <Heading as="h2" size="xl" mb={4}>
            Play & Earn
          </Heading>
          <Image src="/assets/bakery.png" width={600} height={600} />
        </Center>
      </Container>
    </Center>
  );
};

export default LandingPage;
