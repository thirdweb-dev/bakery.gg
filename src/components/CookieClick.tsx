import { Box, BoxProps } from "@chakra-ui/react";

interface CookieClickProps extends BoxProps {
  cookiePerClick: string;
}

export const CookieClick: React.FC<CookieClickProps> = ({
  cookiePerClick,
  ...rest
}) => {
  return <Box {...rest}>+{cookiePerClick}</Box>;
};
