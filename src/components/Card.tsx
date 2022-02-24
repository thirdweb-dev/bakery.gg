import { Box, BoxProps, useColorModeValue } from "@chakra-ui/react";

type DefaultedBoxProps = Pick<
  BoxProps,
  | "shadow"
  | "backgroundColor"
  | "py"
  | "px"
  | "borderRadius"
  | "borderWidth"
  | "borderColor"
>;

const defaultBoxProps: Required<DefaultedBoxProps> = {
  shadow: "sm",
  backgroundColor: "white",
  px: 4,
  py: 4,
  borderRadius: "xl",
  borderWidth: "1px",
  borderColor: "gray.200",
};

export interface CardProps extends BoxProps {}
export const Card: React.FC<CardProps> = ({
  children,
  ...requiredBoxProps
}) => {
  const defaultProps = useColorModeValue(
    { ...defaultBoxProps, borderWidth: "1px", borderColor: "gray.200" },
    { ...defaultBoxProps, borderWidth: 0, borderColor: "transparent" },
  );
  return <Box {...{ ...defaultProps, ...requiredBoxProps }}>{children}</Box>;
};
