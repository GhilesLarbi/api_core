import {
  EmailLayout,
  ContentSection,
  Title,
  BodyText,
  CtaButton,
} from "./_components";
import { getColors, type Mode } from "./_constants";

interface EmailVerificationResendProps {
  mode?: Mode;
  userName?: string;
  verificationUrl?: string;
}

export const EmailVerificationResend = ({
  mode = "light",
  userName = "{{ user_name }}",
  verificationUrl = "{{ verification_url }}",
}: EmailVerificationResendProps) => {
  const c = getColors(mode);

  return (
    <EmailLayout mode={mode} preview="Verify your email address for SaaS Template">
      <ContentSection style={{ padding: "28px 32px 0" }}>
        <Title mode={mode}>Verify your email address</Title>
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
          Here is your verification link for{" "}
          <span style={{ fontWeight: 600, color: c.foreground }}>
            SaaS Template
          </span>
          . Confirm your email address to activate your account. If a previous
          link expired, this one replaces it.
        </BodyText>
      </ContentSection>

      <ContentSection style={{ padding: "28px 32px 4px" }}>
        <CtaButton mode={mode} href={verificationUrl}>
          Verify email address
        </CtaButton>
      </ContentSection>

      <ContentSection style={{ padding: "24px 32px 32px" }}>
        <BodyText mode={mode} style={{ fontSize: 13, color: c.mutedForegroundAlt }}>
          If you did not create an account, you can safely ignore this email.
        </BodyText>
      </ContentSection>
    </EmailLayout>
  );
};

EmailVerificationResend.PreviewProps = {
  mode: "light",
  userName: "Alex Morgan",
  verificationUrl: "https://example.com/verify-email?token=8f3a2b",
} satisfies EmailVerificationResendProps;

export default EmailVerificationResend;
