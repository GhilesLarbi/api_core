import { Paragraph } from "./paragraph";
import { getColors, type Mode } from "../_constants";

interface BodyTextProps {
  mode?: Mode;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const BodyText = ({
  mode = "light",
  style,
  children,
}: BodyTextProps) => {
  const c = getColors(mode);

  return (
    <Paragraph
      style={{
        fontSize: "15px",
        fontWeight: 400,
        letterSpacing: "0.1px",
        lineHeight: "24px",
        color: c.mutedForeground,
        ...style,
      }}
    >
      {children}
    </Paragraph>
  );
};
