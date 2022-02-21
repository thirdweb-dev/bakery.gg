import { ChakraProvider } from "@chakra-ui/react";
import {
  defaultChains,
  defaultL2Chains,
  ThirdwebProvider,
} from "@thirdweb-dev/react";
import { DefaultSeo } from "next-seo";
import { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { WalletLinkConnector } from "wagmi/connectors/walletLink";
import theme from "../theme";

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
  1: `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
  4: `https://eth-rinkeby.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
  5: `https://eth-goerli.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
  250: "https://rpc.ftm.tools",
  43114: "https://api.avax.network/ext/bc/C/rpc",
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
      <QueryClientProvider client={queryClient}>
        <ThirdwebProvider
          desiredChainId={137}
          dAppName="bakery.gg"
          advanced={{
            queryClient,
            supportedChains,
            wagmiOptions: {
              connectors: ({ chainId }) => [
                new InjectedConnector({
                  chains: supportedChains,
                  options: { shimDisconnect: true },
                }),
                new WalletConnectConnector({
                  options: {
                    chainId,
                    rpc: alchemyUrlMap,
                    qrcode: true,
                  },
                  chains: supportedChains,
                }),
                new WalletLinkConnector({
                  chains: supportedChains,
                  options: {
                    appName: "bakery.gg",
                    appLogoUrl: "https://bakery.gg/favicon.ico",
                    darkMode: true,
                    jsonRpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
                  },
                }),
              ],
            },
          }}
        >
          <ChakraProvider resetCSS theme={theme}>
            <Component {...pageProps} />
          </ChakraProvider>
        </ThirdwebProvider>
      </QueryClientProvider>
    </>
  );
}

export default MyApp;
