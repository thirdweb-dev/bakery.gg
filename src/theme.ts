import { extendTheme, ThemeConfig } from "@chakra-ui/react";
import { createBreakpoints } from "@chakra-ui/theme-tools";
import color from "color";

const config = {
  darkest: {
    lightness: 10,
    rotate: 0,
    saturate: 0,
  },
  lightest: {
    lightness: 95,
    rotate: 0,
    saturate: 0,
  },
};

function createShades(centerColor: string): Record<number, string> {
  const _color = centerColor;
  const darkSteps = 4;
  const lightSteps = 5;

  const lightnessStep = (config.lightest.lightness - 50) / lightSteps;
  const darknessStep = (50 - config.darkest.lightness) / darkSteps;

  const lightRotateStep = config.lightest.rotate / lightSteps;
  const darkRotateStep = config.darkest.rotate / darkSteps;

  const lightSaturateStep = config.lightest.saturate / lightSteps;
  const darkSaturateStep = config.darkest.saturate / darkSteps;

  return {
    50: color(_color)
      .lightness(50 + lightnessStep * 5)
      .rotate(lightRotateStep * 5)
      .saturate(lightSaturateStep * 5)
      .hex(),
    100: color(_color)
      .lightness(50 + lightnessStep * 4)
      .rotate(lightRotateStep * 4)
      .saturate(lightSaturateStep * 4)
      .hex(),
    200: color(_color)
      .lightness(50 + lightnessStep * 3)
      .rotate(lightRotateStep * 3)
      .saturate(lightSaturateStep * 3)
      .hex(),
    300: color(_color)
      .lightness(50 + lightnessStep * 2)
      .rotate(lightRotateStep * 2)
      .saturate(lightSaturateStep * 2)
      .hex(),
    400: color(_color)
      .lightness(50 + Number(lightnessStep))
      .rotate(Number(lightRotateStep))
      .saturate(Number(lightSaturateStep))
      .hex(),
    500: centerColor,
    600: color(_color)
      .lightness(50 - Number(darknessStep))
      .rotate(Number(darkRotateStep))
      .saturate(Number(darkSaturateStep))
      .hex(),
    700: color(_color)
      .lightness(50 - darknessStep * 2)
      .rotate(darkRotateStep * 2)
      .saturate(darkSaturateStep * 2)
      .hex(),
    800: color(_color)
      .lightness(50 - darknessStep * 3)
      .rotate(darkRotateStep * 3)
      .saturate(darkSaturateStep * 3)
      .hex(),
    900: color(_color)
      .lightness(50 - darknessStep * 4)
      .rotate(darkRotateStep * 4)
      .saturate(darkSaturateStep * 4)
      .hex(),
  };
}

const fonts = {
  mono: `'Menlo', monospace`,
  heading: "DM Sans",
  body: "DM Sans",
};

const breakpoints = createBreakpoints({
  sm: "40em",
  md: "52em",
  lg: "64em",
  xl: "80em",
});

const theme = extendTheme({
  styles: {
    global: {
      "html, body": {
        padding: 0,
        margin: 0,
        fontFeatureSettings: `'zero' 1`,
        scrollBehavior: "smooth",
      },
      html: {
        backgroundColor: "#000",
      },
      body: {
        background: "transparent",
      },
      "::selection": {
        backgroundColor: "#90cdf4",
        color: "#fefefe",
      },
      "::-moz-selection": {
        backgroundColor: "#90cdf4",
        color: "#fefefe",
      },
    },
  },
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  colors: {
    black: "#16161D",
    discord: createShades("#314db5"),
    opensea: createShades("#3191e8"),
    eventbrite: createShades("#ff8000"),
  },
  fonts,
  breakpoints,
} as ThemeConfig);

export default theme;
