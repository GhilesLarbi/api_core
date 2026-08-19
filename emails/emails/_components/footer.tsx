import { Hr, Link, Section, Text } from "react-email";
import {
  getColors,
  fonts,
  BRAND_NAME,
  COMPANY_ADDRESS,
  SUPPORT_EMAIL,
  type Mode,
} from "../_constants";

interface FooterProps {
  mode?: Mode;
  minimal?: boolean;
}

export const Footer = ({ mode = "light", minimal = false }: FooterProps) => {
  const c = getColors(mode);

  return (
    <Section style={footer}>
      <Hr style={{ borderColor: c.border, margin: "0 0 24px" }} />
      <Text style={{ ...brandText, color: c.primary }}>{BRAND_NAME}</Text>
      {!minimal && (
        <Text style={{ ...bodyText, color: c.mutedForeground }}>
          Need help?{" "}
          <Link
            href={`mailto:${SUPPORT_EMAIL}`}
            style={{ ...link, color: c.accent }}
          >
            {SUPPORT_EMAIL}
          </Link>
        </Text>
      )}
      <Text style={{ ...bodyText, color: c.mutedForegroundAlt }}>
        {COMPANY_ADDRESS}
      </Text>
      <Text style={{ ...bodyText, color: c.mutedForegroundAlt, margin: "4px 0 0" }}>
        © {BRAND_NAME}. All rights reserved.
      </Text>
    </Section>
  );
};

const footer = {
  textAlign: "center" as const,
  padding: "8px 32px 36px",
};

const brandText = {
  fontFamily: fonts.brand,
  fontSize: "15px",
  fontWeight: 600,
  letterSpacing: "-0.3px",
  margin: "0 0 12px",
};

const bodyText = {
  fontFamily: fonts.body,
  fontSize: "13px",
  fontWeight: 400,
  lineHeight: "20px",
  margin: "0 auto",
  maxWidth: "460px",
};

const link = {
  textDecoration: "none",
  fontWeight: 600,
};
