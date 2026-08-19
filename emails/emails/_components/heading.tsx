import { Paragraph } from "./paragraph";
import { getColors, fonts, type Mode } from "../_constants";

interface HeadingProps {
  mode?: Mode;
  level?: 1 | 2 | 3;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const levelStyles = {
  1: {
    fontSize: "26px",
    fontWeight: "bold" as const,
    lineHeight: "normal",
  },
  2: {
    fontSize: "16px",
    fontWeight: 600,
    lineHeight: "normal",
  },
  3: {
    fontSize: "15px",
    fontWeight: 400,
    letterSpacing: "0.3px",
    lineHeight: "normal",
  },
};

const colorKeys = {
  1: "foreground",
  2: "subtitle",
  3: "mutedForeground",
} as const;

export const Heading = ({
  mode = "light",
  level = 1,
  style,
  children,
}: HeadingProps) => {
  const c = getColors(mode);

  return (
    <Paragraph
      style={{
        fontFamily: fonts.body,
        ...levelStyles[level],
        color: c[colorKeys[level]],
        ...style,
      }}
    >
      {children}
    </Paragraph>
  );
};
