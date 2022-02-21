import NextDocument, { Html, Head, Main, NextScript } from "next/document";
import { ColorModeScript } from "@chakra-ui/react";

import theme from "../theme";

export default class Document extends NextDocument {
  render() {
    return (
      <Html style={{ backgroundColor: "#000" }}>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="true"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&display=swap"
            rel="stylesheet"
          />
        </Head>

        {/* eslint-disable-next-line react/forbid-dom-props */}
        <body style={{ background: "transparent" }}>
          {/* Make Color mode to persists when you refresh the page. */}
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
