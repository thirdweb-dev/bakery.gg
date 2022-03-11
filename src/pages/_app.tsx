import { ChakraProvider } from "@chakra-ui/react";
import { defaultChains, defaultL2Chains } from "@thirdweb-dev/react";
import { DefaultSeo } from "next-seo";
import { AppProps } from "next/app";
import { QueryClient } from "react-query";
import { Providers } from "../components/Provider";
import theme from "../theme";
import { ChainId } from "../utils/network";
import "../styles/style.css";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 24 hours
      cacheTime: 1000 * 60 * 60 * 24,
      // 30 seconds
      staleTime: 1000 * 30,
    },
  },
});

export const alchemyUrlMap: Record<number, string> = {
  137: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
  80001: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
};

const supportedChains = [...defaultChains, ...defaultL2Chains];

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <DefaultSeo
        defaultTitle="bakery.gg"
        description="Have you ever clicked some cookies?"
        additionalLinkTags={[
          {
            rel: "icon",
            href: "/favicon.ico",
          },
        ]}
        openGraph={{
          title: "bakery.gg",
          type: "website",
          locale: "en_US",
          url: "https://bakery.gg/",
          site_name: "bakery.gg",
          images: [
            {
              url: `/opengraph-thumbnail.png`,
              width: 1200,
              height: 630,
              alt: "bakery.gg",
            },
          ],
        }}
        twitter={{
          handle: "@thirdweb_",
          site: "@thirdweb_",
          cardType: "summary_large_image",
        }}
      />
      <Providers chainId={ChainId.Mumbai}>
        <ChakraProvider resetCSS theme={theme}>
          <Component {...pageProps} />
        </ChakraProvider>
      </Providers>
    </>
  );
}

export default MyApp;
