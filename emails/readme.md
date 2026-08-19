# SaaS Template Emails

Transactional email templates for SaaS Template, built with [React Email](https://react.email). Templates are exported as static HTML with Jinja tokens baked in and sent by the backend.

## Getting Started

```sh
pnpm install
pnpm dev              # live preview at http://localhost:3000
```

## Export to the Backend

```sh
pnpm export:backend   # renders every template and copies it into ../backend/app/templates/emails/
```

## Templates

- `email-verification-resend` — verify the email address (signup and resend)
- `reset-password` — password reset link
- `confirm-email-change` — confirm a changed email address

See `.agents/emails/AGENTS.md` for conventions and `BACKEND-GUIDE.md` for the backend workflow.
