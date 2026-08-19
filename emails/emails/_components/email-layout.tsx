import { Body, Container, Head, Html, Preview, Section } from "react-email";
import { Header } from "./header";
import { Footer } from "./footer";
import { getColors, fonts, EMAIL_WIDTH, type Mode } from "../_constants";

interface EmailLayoutProps {
  mode?: Mode;
  preview: string;
  minimalFooter?: boolean;
  children: React.ReactNode;
}

export const EmailLayout = ({
  mode = "light",
  preview,
  minimalFooter,
  children,
}: EmailLayoutProps) => {
  const c = getColors(mode);

  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ ...main, backgroundColor: c.background }}>
        <Container style={{ ...container, maxWidth: EMAIL_WIDTH }}>
          <Container
            style={{
              ...card,
              backgroundColor: c.surface,
              border: `1px solid ${c.border}`,
            }}
          >
            <Section
              style={{ height: "4px", backgroundColor: c.primary, fontSize: 0, lineHeight: "4px" }}
            >
              &nbsp;
            </Section>
            <Header mode={mode} />
            {children}
            <Footer mode={mode} minimal={minimalFooter} />
          </Container>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  fontFamily: fonts.body,
  padding: "48px 16px",
  WebkitFontSmoothing: "antialiased" as const,
  MozOsxFontSmoothing: "grayscale" as const,
};

const container = {
  margin: "0 auto",
  padding: "0",
  width: "100%",
};

const card = {
  margin: "0 auto",
  padding: "0",
  width: "100%",
  borderRadius: "16px",
  overflow: "hidden" as const,
};
