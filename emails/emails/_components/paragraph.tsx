import { Text } from "react-email";

interface ParagraphProps {
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const Paragraph = ({ style, children }: ParagraphProps) => (
  <Text
    style={{
      margin: "0",
      padding: "0",
      ...style,
    }}
  >
    {children}
  </Text>
);
