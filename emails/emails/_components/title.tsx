import { Paragraph } from "./paragraph";
import { getColors, type Mode } from "../_constants";

interface TitleProps {
  mode?: Mode;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const Title = ({ mode = "light", style, children }: TitleProps) => {
  const c = getColors(mode);

  return (
    <Paragraph
      style={{
        fontSize: "26px",
        fontWeight: "bold",
        lineHeight: "normal",
        color: c.foreground,
        ...style,
      }}
    >
      {children}
    </Paragraph>
  );
};
