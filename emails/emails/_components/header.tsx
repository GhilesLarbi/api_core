import { Hr, Section, Text } from "react-email";
import { getColors, fonts, type Mode } from "../_constants";

interface HeaderProps {
  mode?: Mode;
}

export const Header = ({ mode = "light" }: HeaderProps) => {
  const c = getColors(mode);

  return (
    <Section style={header}>
      <Text
        style={{
          fontFamily: fonts.brand,
          fontSize: "21px",
          fontWeight: 700,
          letterSpacing: "-0.4px",
          margin: 0,
          color: c.primary,
        }}
      >
        SaaS <span style={{ color: c.foreground }}>Template</span>
      </Text>
      <Hr style={{ borderColor: c.border, margin: "20px 0 0" }} />
    </Section>
  );
};

const header = {
  padding: "28px 32px 0",
};
