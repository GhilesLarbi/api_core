import { Link } from "react-email";
import {
  EmailLayout,
  ContentSection,
  Title,
  BodyText,
  CtaButton,
} from "./_components";
import { getColors, type Mode } from "./_constants";

interface ResetPasswordProps {
  mode?: Mode;
  resetUrl?: string;
}

export const ResetPassword = ({
  mode = "light",
  resetUrl = "{{ reset_url }}",
}: ResetPasswordProps) => {
  const c = getColors(mode);

  return (
    <EmailLayout mode={mode} preview="Reset your SaaS Template password">
      <ContentSection style={{ padding: "28px 32px 0" }}>
        <Title mode={mode}>Reset your password</Title>
      </ContentSection>

      <ContentSection style={{ padding: "20px 32px 0" }}>
        <BodyText mode={mode}>Hi,</BodyText>
        <BodyText mode={mode} style={{ marginTop: 12 }}>
          You are receiving this email because we received a request to reset
          the password for your account.
        </BodyText>
      </ContentSection>

      <ContentSection style={{ padding: "28px 32px 4px" }}>
        <CtaButton mode={mode} href={resetUrl}>
          Reset password
        </CtaButton>
      </ContentSection>

      <ContentSection style={{ padding: "24px 32px 0" }}>
        <BodyText mode={mode} style={{ fontSize: 13 }}>
          Or open this link:
          <br />
          <Link
            href={resetUrl}
            style={{ color: c.accent, textDecoration: "underline", wordBreak: "break-all" }}
          >
            {resetUrl}
          </Link>
        </BodyText>
      </ContentSection>

      <ContentSection style={{ padding: "16px 32px 32px" }}>
        <BodyText mode={mode} style={{ fontSize: 13, color: c.mutedForegroundAlt }}>
          If you did not request a password reset, no further action is
          required.
        </BodyText>
      </ContentSection>
    </EmailLayout>
  );
};

ResetPassword.PreviewProps = {
  mode: "light",
  resetUrl: "https://example.com/reset-password?token=abc123&email=alex%40example.com",
} satisfies ResetPasswordProps;

export default ResetPassword;
