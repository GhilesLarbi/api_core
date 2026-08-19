import { Paragraph } from "./paragraph";
import { getColors, type Mode } from "../_constants";

interface SubtitleProps {
  mode?: Mode;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const Subtitle = ({ mode = "light", style, children }: SubtitleProps) => {
  const c = getColors(mode);

  return (
    <Paragraph
      style={{
        fontSize: "26px",
        fontWeight: 500,
        lineHeight: "normal",
        color: c.subtitle,
        ...style,
      }}
    >
      {children}
    </Paragraph>
  );
};
