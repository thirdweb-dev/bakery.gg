import {
  Text,
  Center,
  Container,
  Flex,
  Heading,
  Image,
  AspectRatio,
  Skeleton,
  SkeletonText,
  Divider,
  LightMode,
} from "@chakra-ui/react";
import { useAddress } from "@thirdweb-dev/react";
import TweetEmbed from "react-tweet-embed";
import { Logo } from "../components/Logo";
import { usePrize } from "../hooks/usePrize";
import { SiDiscord, SiEventbrite } from "react-icons/si";
import { LinkButton } from "../components/link-button";

const bundleCollectionModule =
  process.env.NEXT_PUBLIC_BUNDLE_COLLECTION_ADDRESS;

const openseaBaseUrl =
  process.env.NEXT_PUBLIC_IS_TESTNET === "true"
    ? "https://testnets.opensea.io/assets/mumbai"
    : "https://opensea.io/assets/mumbai";

const ClaimSuccessPage = () => {
  const address = useAddress();
  const prize = usePrize(address);

  console.log("prize", prize);

  const isLoaded = !!prize.data;

  return (
    <Center alignItems="flex-start" minH="100vh" as="main" py={8}>
      <Container maxW="container.xl" px={8}>
        <Flex direction="column" gap={8}>
          <Flex flexDir="column" as="header" justify="center" align="center">
            <Logo py={8} color="#fff" />
          </Flex>
          <Flex direction="column" gap={8} align="center">
            <AspectRatio ratio={1} w="100%" maxW="500px">
              <Skeleton
                boxShadow="0px 16px 32px rgba(0, 0, 0, 0.4)"
                isLoaded={isLoaded}
                borderRadius="lg"
              >
                <Image
                  width="100%"
                  height="100%"
                  src={prize.data?.metadata.image}
                  alt={prize.data?.metadata.name}
                />
              </Skeleton>
            </AspectRatio>
            <SkeletonText noOfLines={8} spacing="4" isLoaded={isLoaded}>
              <Flex gap={3} flexDirection="column">
                <Heading fontSize="36px">
                  Congrats, you claimed {prize.data?.metadata.name}!
                </Heading>
                {prize.data?.metadata?.description && (
                  <Text fontSize="md">{prize.data?.metadata?.description}</Text>
                )}
              </Flex>
            </SkeletonText>
            <Skeleton w="full" isLoaded={prize.data?.metadata.id !== undefined}>
              <LightMode>
                <LinkButton
                  isFullWidth
                  colorScheme="opensea"
                  isDisabled={!prize.data?.metadata.id}
                  href={
                    prize.data?.metadata.id
                      ? `${openseaBaseUrl}/${bundleCollectionModule}/${prize.data.metadata.id}`
                      : ""
                  }
                  isExternal
                >
                  View on OpenSea
                </LinkButton>
              </LightMode>
            </Skeleton>
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
              <LinkButton
                isFullWidth
                href="https://discord.gg/RYaTnk2z4g"
                isExternal
                noIcon
                colorScheme="discord"
                leftIcon={<SiDiscord />}
              >
                Join us in Discord
              </LinkButton>
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

export default ClaimSuccessPage;
