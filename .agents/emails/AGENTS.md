# SaaS Template Email Templates

Email templates for the SaaS Template platform. Templates are designed in React Email, exported as static HTML, and sent by the backend (FastAPI + fastapi-mail over SMTP).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Email 6 |
| Language | TypeScript, React 19 |
| Package Manager | pnpm |
| Styling | Inline CSS (not Tailwind) |

## Project Structure

```
emails/
├── _components/        # Shared components (EmailLayout, Header, Footer, …) — underscore hides from preview sidebar
├── _constants/         # Colors, fonts, shared values — underscore hides from preview sidebar
│   ├── colors.ts       # ALL color tokens (light/dark mode)
│   ├── fonts.ts        # Font stacks
│   └── index.ts        # Re-exports + brand name, support email, email width, address
└── *.tsx               # Email templates
scripts/
└── export-to-backend.sh  # Export helper for backend devs
```

## Templates

| File | Jinja tokens | Purpose |
|------|--------------|---------|
| `email-verification-resend.tsx` | `user_name`, `verification_url` | Verify the email address (sent on signup and on resend) |
| `reset-password.tsx` | `reset_url` | Password reset CTA + plain-link fallback |
| `confirm-email-change.tsx` | `user_name`, `verification_url` | Confirm a changed email address |

## Critical Rules

### Colors — No Inline Hex Values

**ALL colors must come from `emails/_constants/colors.ts`.** Never hardcode hex values in templates or components. When adding new colors, add them to the constants file first, then reference them.

```ts
// WRONG
const style = { color: '#8B8B8B' };

// RIGHT
import { getColors } from '../_constants';
const c = getColors(mode);
const style = { color: c.mutedForeground };
```

### Light/Dark Mode

Every template and component accepts a `mode` prop (`'light' | 'dark'`). Colors switch based on this prop via `getColors(mode)`. `mode` is **not** a backend variable — it defaults to `'light'` and is baked in at export. The backend never sends colors or a theme; dark mode is a future step (CSS `@media (prefers-color-scheme: dark)`), not server-driven.

### Reusable Components

Every template **must** wrap its content in the shared `EmailLayout` component from `emails/_components/` (it renders `Header` and `Footer` automatically).

## Design Tokens

### Color Tokens (`emails/_constants/colors.ts`)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `background` | `#F3F4F6` | `#111827` | Page background |
| `surface` | `#FFFFFF` | `#1F2937` | Content surface |
| `foreground` | `#111827` | `#FFFFFF` | Primary text, bold names |
| `subtitle` | `#4B5563` | `#9CA3AF` | Subtitles |
| `mutedForeground` | `#374151` | `#D1D5DB` | Body text, secondary |
| `mutedForegroundAlt` | `#9CA3AF` | `#6B7280` | Footer fine print |
| `accent` / `primary` | `#007AFF` | `#0A84FF` | Links, brand accent |
| `primaryDark` | `#0060DF` | `#007AFF` | Primary hover/dark variant |
| `primaryForeground` | `#FFFFFF` | `#0B1220` | Text on primary surfaces |
| `primarySoft` | `#EFF6FF` | `#1F2937` | Soft primary background |
| `destructive` | `#DC2626` | `#F87171` | Destructive accents |
| `destructiveForeground` | `#FFFFFF` | `#111827` | Text on destructive surfaces |
| `card` | `#F9FAFB` | `#1F2937` | Elevated surfaces |
| `border` | `#E5E7EB` | `#374151` | Dividers, borders |

**Brand:** `#007AFF` (blue) — `colors.brand.primary`

### Fonts (`emails/_constants/fonts.ts`)

| Token | Value | Usage |
|-------|-------|-------|
| `brand` | Poppins, sans-serif | Brand wordmark text |
| `body` | System font stack | All body content |

### Shared Values (`emails/_constants/index.ts`)

| Constant | Value |
|----------|-------|
| `BRAND_NAME` | `SaaS Template` |
| `SUPPORT_EMAIL` | `support@example.com` |
| `EMAIL_WIDTH` | `600` |
| `COMPANY_ADDRESS` | `SaaS Template` |

## Template Conventions

- **Named export + default export** (e.g., `export const MyEmail = ...` + `export default MyEmail`)
- **Prop defaults are the Jinja tokens** the backend fills (`userName = "{{ user_name }}"`) — not sample data
- **PreviewProps** hold the human-readable sample data shown in `pnpm dev` (dev-only; `pnpm export` ignores them and uses the defaults)
- **Inline CSS directly on elements** — do not extract styles into variables or constants; write `style={{ ... }}` directly on each element
- **Max width:** 600px
- **Import components:** `import { EmailLayout, ContentSection, Title, BodyText, CtaButton } from './_components'`
- **Import constants:** `import { getColors, type Mode } from './_constants'`

## Template Skeleton

```tsx
import { EmailLayout, ContentSection, Title, BodyText, CtaButton } from './_components';
import { getColors, type Mode } from './_constants';

interface MyEmailProps {
  mode?: Mode;
  userName?: string;
  // ... other props
}

export const MyEmail = ({
  mode = 'light',
  userName = '{{ user_name }}', // default = Jinja token the backend fills
}: MyEmailProps) => {
  const c = getColors(mode);

  return (
    <EmailLayout mode={mode} preview="Preview text here">
      <ContentSection style={{ padding: '28px 32px 0' }}>
        <Title mode={mode}>Title here</Title>
      </ContentSection>
      {/* Template content */}
    </EmailLayout>
  );
};

MyEmail.PreviewProps = {
  mode: 'light',
  userName: 'Alex Morgan', // sample data for `pnpm dev` only
} satisfies MyEmailProps;

export default MyEmail;
```

## Commands

```bash
pnpm dev              # Dev server with live preview
pnpm build            # Build templates
pnpm export           # Export to static HTML in out/
pnpm export:backend   # Export + copy into ../backend/app/templates/emails/ (kebab→snake, overwrites)
```

## Backend Integration

Templates are **drop-in** — the backend never hand-edits them. Every dynamic value is a prop whose **default is the Jinja token** the backend fills; `PreviewProps` holds sample data for the dev preview only.

```tsx
export const MyEmail = ({
  userName = "{{ user_name }}",  // default = Jinja token → used by `pnpm export`
}: MyEmailProps) => ( ... );

MyEmail.PreviewProps = {
  userName: "Alex Morgan",       // sample data → used by `pnpm dev` only
} satisfies MyEmailProps;
```

`pnpm dev` renders PreviewProps (looks real); `pnpm export` renders the defaults (emits `{{ user_name }}`). React Email's PreviewProps are dev-only — export always uses the defaults.

### Workflow

1. Design in React Email with `pnpm dev`
2. Put Jinja tokens in the prop defaults, sample data in PreviewProps
3. Run `pnpm export:backend` — exports to `out/` and copies each file into `../backend/app/templates/emails/`, converting kebab-case → snake_case (`reset-password.html` → `reset_password.html`) and overwriting the old one
4. Add/adjust the matching context in `backend/app/services/notification/notification_service.py` so every `{{ token }}` is provided

**No manual Jinja editing of the exported HTML — ever.**

### Dynamic-value rules

- **Scalars** → one prop, default is the token: `verifyUrl = "{{ verify_url }}"`.
- **Lists can't be tokens.** A Jinja `{% for %}` loop can't be emitted from JSX cleanly (React escapes the quotes in loop/filter syntax, and per-item inline-style conditionals break). When the count is fixed, use **separate scalar props** — e.g. three `teamAvatar1/2/3`, not a `teamAvatarUrls: string[]`.
- **Env-varying URLs** (staging `staging.example.com` vs prod `example.com`) → backend sends them **scheme-less**; the template prepends `https://` only in the href and shows the bare value as text. One token serves both:
  ```tsx
  <Link href={`https://${docsUrl}`}>{docsUrl}</Link>  // docsUrl = "{{ docs_url }}"
  ```
  Do **not** add a `*_display` twin var or use `.replace("https://","")` — the strip runs at export, before Jinja fills the token, so it does nothing.
- **Env-independent constants** (e.g. a public community invite) → hardcode directly in the JSX, no prop.

## Things to Avoid

- Tailwind CSS wrapper — use inline styles only
- Inline hex colors — always use constants
- Raw HTML elements — use React Email components
- Templates that don't wrap their content in `EmailLayout`
- Arbitrary colors not from the design system
- Sample data left in prop defaults — defaults must be the `{{ jinja_token }}`; sample data goes in `PreviewProps` only (otherwise `pnpm export` bakes the sample values into the backend template)
- Array/list props for repeated elements — they can't become a `{% for %}` loop on export; use fixed scalar props (`avatar1/2/3`)
- `_display` twin vars or `.replace("https://","")` for URLs — send the URL scheme-less and prepend `https://` in the href instead
- Manually editing the exported HTML to insert Jinja — the tokens come from the prop defaults

## Never wait (MANDATORY)

Never run anything that blocks: no `sleep`, no polling loop, no waiting for something to become
ready. The user is watching, and waiting is never acceptable.

If a command does not return quickly, kill it and take the fast way out instead of diagnosing while
it hangs.
