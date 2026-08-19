import { Section } from "react-email";

interface ContentSectionProps {
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const ContentSection = ({ style, children }: ContentSectionProps) => (
  <Section
    style={{
      paddingLeft: "16px",
      paddingRight: "16px",
      ...style,
    }}
  >
    {children}
  </Section>
);
