Ask the user these questions **one at a time**, waiting for each response before asking the next:

1. "Paste the Figma link for the **light mode** design:"
2. "Paste the Figma link for the **dark mode** design (or press Enter to skip):"
3. "What should the email template be named?" — offer options:
   - `auto` — derive the name automatically from the Figma design (use the Figma node name/frame name from step 1, convert to kebab-case, e.g. "Email/Monthly Review" → `monthly-review`)
   - Common names like `welcome`, `password-reset`, `invite-user`
   - Let the user type a custom name

Once you have the answers, proceed with all steps below. Print a progress line before each step.

---

**[1/6] Fetch Figma design**

Use the `mcp__plugin_figma_figma__get_design_context` tool to fetch the light mode design. Extract `fileKey` and `nodeId` from the URL:

- URL format: `figma.com/design/:fileKey/:fileName?node-id=:nodeId`
- Convert `-` to `:` in nodeId
- Set `clientFrameworks` to `react`
- Set `clientLanguages` to `typescript`

If a dark mode link was provided, fetch that too in a second call.

---

**[2/6] Study existing templates as reference**

Before writing any code, read these template files completely:

- `emails/email-verification-resend.tsx`
- `emails/reset-password.tsx`
- `emails/confirm-email-change.tsx`

Study how they are coded and styled — component usage, inline CSS patterns, spacing, prop patterns, how `mode` flows through, how reusable components are used (`EmailLayout`, `ContentSection`, `Title`, `Subtitle`, `BodyText`, `Heading`, `CtaButton`). The new template must follow the exact same patterns.

Also read `emails/_components/index.ts` to see all available reusable components.

---

**[3/6] Review design and plan colors**

Study the Figma screenshot and code output carefully.

Read `emails/_constants/colors.ts` to check existing color tokens. If the Figma design uses colors not yet in the constants file, add them with descriptive token names following the existing pattern.

**Critical rule:** NO inline hex values in templates. Every color must come from `getColors(mode)` or `colors.brand`.

---

**[4/6] Create the email template**

Create the file at `emails/<template-name>.tsx`.

Follow these conventions exactly (and match what you observed in the reference templates):

- **Imports:** `react-email` components, reusable components from `./_components`, colors/fonts/constants from `./_constants`
- **Props interface:** Always include `mode?: Mode` plus any template-specific props
- **Dynamic values → props whose defaults are the Jinja tokens** the backend fills (`userName = "{{ user_name }}"`). Rules:
  - Scalars only — **lists can't be tokens** (a `{% for %}` loop can't be emitted from JSX). For a fixed count use separate scalar props (`avatar1/2/3`), not `avatars: string[]`.
  - Env-varying URLs: backend sends them scheme-less; prepend `https://` in the href only — `` href={`https://${url}`} `` with `url = "{{ some_url }}"`. No `_display` twin, no `.replace("https://","")`.
  - Env-independent constants (e.g. the Discord link): hardcode in the JSX.
- **Colors:** `const c = getColors(mode)` — use `c.background`, `c.foreground`, `c.mutedForeground`, etc.
- **Reusable components:** Use `EmailLayout` (wraps Header + Footer automatically), `ContentSection`, `Title`, `Subtitle`, `BodyText`, `Heading`, `CtaButton` — do not recreate what these components already provide
- **Exports:** Named export (`export const TemplateName = ...`) AND default export (`export default TemplateName`)
- **PreviewProps:** the human-readable sample data for `pnpm dev` (dev-only). Put real-looking values here (`userName: 'Cameron Petitti'`) while the prop **defaults** stay as `{{ tokens }}`: `TemplateName.PreviewProps = { mode: 'light', userName: 'Cameron Petitti', ... } satisfies Props`
- **Styles:** Inline CSS directly on elements (`style={{ ... }}`). Do NOT extract styles into variables or constants
- **Spacing:** Components have no built-in margin/padding — pass spacing via `style` prop on each component instance
- **Fonts:** Use `fonts.body` for body, `fonts.brand` for brand text
- **Max width:** Use `EMAIL_WIDTH` constant (600px)
- **Light/dark mode:** All color references go through `getColors(mode)`. If dark mode Figma was provided, match both designs pixel-perfect. If not, dark mode comes from color token swapping only.

Match the Figma design as closely as possible — spacing, font sizes, layout, hierarchy. Use React Email components (`Section`, `Row`, `Column`, `Text`, `Button`, `Img`, `Link`, `Hr`) — never raw HTML.

---

**[5/6] Verify the template**

Read back the created file and verify:

- [ ] No hardcoded hex colors — all from constants
- [ ] Uses `EmailLayout` (not manual Header/Footer)
- [ ] Uses reusable components where applicable (Title, Subtitle, BodyText, Heading, CtaButton, ContentSection)
- [ ] `mode` prop with `getColors(mode)` pattern
- [ ] Named export + default export
- [ ] Prop defaults are `{{ jinja_tokens }}`; sample data only in PreviewProps
- [ ] No list/array props for repeated elements (use scalar `x1/x2/x3`)
- [ ] Env-varying URLs sent scheme-less with `https://` prepended in href (no `_display`/`.replace`)
- [ ] PreviewProps defined
- [ ] All styles inline on elements — no extracted style constants
- [ ] Components have margin/padding passed via `style` prop
- [ ] Imports from `./_components` and `./_constants`
- [ ] Matches coding patterns from the reference templates

Fix any violations before proceeding.

---

**[6/6] Preview**

Run `pnpm dev` in the background so the user can preview the template in the browser.

Display a summary:

```
Template "<template-name>" created!

  File:     emails/<template-name>.tsx
  Preview:  http://localhost:3000
```
