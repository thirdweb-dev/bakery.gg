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
        <Flex direction="column" gap={8}>
          <Flex flexDir="column" as="header" justify="center" align="center">
            <Logo py={8} color="#fff" />
            <Heading
              color="white"
              textAlign="center"
              size="3xl"
              as="h2"
              lineHeight={1.3}
            >
              Has anyone seen web3?
            </Heading>
          </Flex>
          <Flex
            as="section"
            align="center"
            justify="center"
            flexDir="column"
            gap={1}
          >
            <Heading fontWeight={500} textAlign="center" size="xl">
              Mint a free NFT and redeem to claim a prize!
            </Heading>
            <Text fontSize="sm" opacity={0.8} textAlign="center">
              (we&apos;ll cover the gas fees)
            </Text>
          </Flex>
          <Flex as="section" flexDir="column" gap={3}>
            {address ? (
              <MintButon isLoading={status.isLoading} isSoldOut={isSoldOut} />
            ) : (
              <ConnectWalletButton isLoading={status.isLoading} />
            )}
            <Text textAlign="center" opacity="0.8">
              <Skeleton isLoaded={status.isSuccess} as="span">
                {totalMinted}
              </Skeleton>{" "}
              /{" "}
              <Skeleton isLoaded={status.isSuccess} as="span">
                {totalAvailable}
              </Skeleton>{" "}
              minted
            </Text>
          </Flex>
          <Flex as="section" flexDir="column" gap={8}>
            <Heading size="md" as="h3">
              You could win:
            </Heading>
            <SimpleGrid gap={8} columns={{ base: 1, md: 3 }}>
              <AspectRatio w="100%" ratio={370 / 209}>
                <Flex
                  gap={2}
                  p={4}
                  flexDir="column"
                  align="flex-start!important"
                  justify="flex-start!important"
                  borderRadius="lg"
                  bg="linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), conic-gradient(from 136.04deg at 71.2% 21.63%, #7CCE7F 0deg, #FF6D4D 69.21deg, #84E9FF 114.38deg, #918FF4 183.75deg, #7CCE7F 360deg);"
                >
                  <Text fontSize="lg">
                    <strong>ETH</strong> and <strong>MATIC</strong> gas grants
                  </Text>
                  <Heading size="lg" as="h4">
                    Worth up to 1ETH!
                  </Heading>
                </Flex>
              </AspectRatio>
              <AspectRatio w="100%" ratio={370 / 209}>
                <Flex
                  as={LinkBox}
                  gap={2}
                  p={4}
                  flexDir="column"
                  align="flex-start!important"
                  justify="flex-start!important"
                  borderRadius="lg"
                  bg="linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), linear-gradient(177.48deg, #F888CB 6.72%, #FF5F3C 48.69%, #D65A5A 77.98%);"
                >
                  <Text fontSize="lg">Swag to collect at our event</Text>
                  <Heading size="lg" as="h4">
                    <LinkOverlay
                      textDecor="underline"
                      isExternal
                      href="https://thirdwebxethdenver22.eventbrite.com/"
                    >
                      thirdweb @ ETH Denver
                    </LinkOverlay>
                  </Heading>
                </Flex>
              </AspectRatio>
              <AspectRatio w="100%" ratio={370 / 209}>
                <Flex
                  as={LinkBox}
                  position="relative"
                  gap={2}
                  p={4}
                  flexDir="column"
                  align="flex-start!important"
                  justify="flex-start!important"
                  borderRadius="lg"
                  bg=" linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), linear-gradient(126.06deg, #E888F8 30.8%, #4B3CFF 66.64%, #035349 91.66%);"
                >
                  <Text fontSize="lg">One lucky winner will receive</Text>
                  <Heading size="lg" as="h4">
                    an NFT from{" "}
                    <LinkOverlay
                      textDecor="underline"
                      isExternal
                      href="https://opensea.io/collection/mfers"
                    >
                      the mfers collection
                    </LinkOverlay>
                  </Heading>
                  <Image
                    position="absolute"
                    right={4}
                    bottom={4}
                    borderRadius="full"
                    boxSize={12}
                    alt=""
                    src="images/mfer.png"
                  />
                </Flex>
              </AspectRatio>
            </SimpleGrid>
          </Flex>
          <Divider />
          <LightMode>
            <Flex direction={{ base: "column", md: "row" }} w="full" gap={4}>
              <LinkButton
                isFullWidth
                href="https://thirdwebxethdenver22.eventbrite.com/"
                isExternal
                noIcon
                colorScheme="eventbrite"
                leftIcon={<SiEventbrite />}
              >
                Meet us @ ETH Denver
              </LinkButton>
              {/* <LinkButton
                isFullWidth
                href="https://discord.gg/RYaTnk2z4g"
                isExternal
                noIcon
                colorScheme="discord"
                leftIcon={<SiDiscord />}
              >
                Join us in Discord
              </LinkButton> */}
            </Flex>
          </LightMode>
          <Divider />
          <Container px={0} maxW="container.sm">
            <TweetEmbed options={{ theme: "dark" }} id="1492205521507700736" />
          </Container>
          <Text textAlign="center" opacity="0.8">
            © thirdweb. all rights reserved.
          </Text>
        </Flex>
      </Container>
    </Center>
  );
};

export default LandingPage;
