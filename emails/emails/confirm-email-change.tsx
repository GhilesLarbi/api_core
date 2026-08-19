import {
  EmailLayout,
  ContentSection,
  Title,
  BodyText,
  CtaButton,
} from "./_components";
import { getColors, type Mode } from "./_constants";

interface ConfirmEmailChangeProps {
  mode?: Mode;
  userName?: string;
  verificationUrl?: string;
}

export const ConfirmEmailChange = ({
  mode = "light",
  userName = "{{ user_name }}",
  verificationUrl = "{{ verification_url }}",
}: ConfirmEmailChangeProps) => {
  const c = getColors(mode);

  return (
    <EmailLayout mode={mode} preview="Confirm your new email address">
      <ContentSection style={{ padding: "28px 32px 0" }}>
        <Title mode={mode}>Confirm your new email address</Title>
      </ContentSection>

      <ContentSection style={{ padding: "20px 32px 0" }}>
        <BodyText mode={mode} style={{ marginBottom: 16 }}>
          Hi{" "}
          <span style={{ fontWeight: 700, color: c.foreground }}>
            {userName}
          </span>
          ,
        </BodyText>
        <BodyText mode={mode}>
          You asked to change the email address on your{" "}
          <span style={{ fontWeight: 600, color: c.foreground }}>
            SaaS Template
          </span>{" "}
          account. Confirm the new address with the button below.
        </BodyText>
      </ContentSection>

      <ContentSection style={{ padding: "28px 32px 4px" }}>
        <CtaButton mode={mode} href={verificationUrl}>
          Confirm email address
        </CtaButton>
      </ContentSection>

      <ContentSection style={{ padding: "24px 32px 32px" }}>
        <BodyText mode={mode} style={{ fontSize: 13, color: c.mutedForegroundAlt }}>
          If you did not request this change, you can safely ignore this email.
        </BodyText>
      </ContentSection>
    </EmailLayout>
  );
};

ConfirmEmailChange.PreviewProps = {
  mode: "light",
  userName: "Alex Morgan",
  verificationUrl: "https://example.com/confirm-email-change?token=8f3a2b",
} satisfies ConfirmEmailChangeProps;

export default ConfirmEmailChange;
