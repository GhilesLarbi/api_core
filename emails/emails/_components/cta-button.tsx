import { Button, Section } from "react-email";
import { getColors, fonts, type Mode } from "../_constants";

interface CtaButtonProps {
  mode?: Mode;
  href?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const CtaButton = ({
  mode = "light",
  href = "#",
  style,
  children,
}: CtaButtonProps) => {
  const c = getColors(mode);

  return (
    <Section style={{ textAlign: "center" }}>
      <Button
        href={href}
        style={{
          fontFamily: fonts.body,
          fontSize: "16px",
          fontWeight: 600,
          letterSpacing: "0.2px",
          lineHeight: "normal",
          borderRadius: "10px",
          padding: "14px 28px",
          width: "100%",
          maxWidth: "360px",
          boxSizing: "border-box",
          textAlign: "center",
          display: "block",
          margin: "0 auto",
          backgroundColor: c.primary,
          color: c.primaryForeground,
          ...style,
        }}
      >
        {children}
      </Button>
    </Section>
  );
};
