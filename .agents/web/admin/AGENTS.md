# SaaS Template Admin Dashboard — Claude Code Instructions

This is the **SaaS Template admin dashboard** — the back office used by staff to run the platform and manage admin accounts. It is a **Vite SPA** with TanStack Router, NOT Next.js.

Read all context files before starting any task.

## Context

- [Client](../../context/client.md) — business context, modules, brand
- [Conventions](../../context/conventions.md) — coding rules, patterns, data fetching

## Auth and permissions

Admins never self-register. `POST /api/v1/admin/login` is the only way in, and every account is created by another admin who holds `admins.create`.

`GET /api/v1/admin/me` returns the signed-in admin **with the permissions they hold**, `_authenticated`'s `beforeLoad` refreshes it into `useAuthStore` on every navigation, and `src/lib/permissions.ts` is the only thing that reads it. That store copy is the single source of truth for the whole UI — never re-derive it, never cache a second copy.

Permissions are **paths from the backend tree** (`backend/app/core/permissions.py`) and only leaves are grantable, so a check is exact string equality, never a prefix match: holding `admins` is not a thing that can happen. The `PermissionPath` union in `src/types/admin.d.ts` lists every leaf, so a typo is a compile error and every call site gets IntelliSense. **That union is hand-mirrored from the backend — when a permission is added, seeded, or renamed there, update it here in the same change.**

### Gating a page

The route declares what it needs; it does not check anything itself.

```tsx
export const Route = createFileRoute('/_authenticated/admins/')({
  staticData: { permission: 'admins.read' },
  component: Admins,
})
```

`_authenticated`'s `beforeLoad` reads `staticData.permission` off every match in the chain and redirects to `/403` if one is missing. One line per page, one enforcement point. Do not write a permission check inside a page component.

### Gating an element

`<Can>` renders or it doesn't — that is its whole job.

```tsx
<Can permission='admins.create'>
  <Button>New admin</Button>
</Can>

<Can permission='admins.grant' fallback={<ReadOnlyBadge />}>
  <PermissionsEditor />
</Can>
```

Anything that is not "show or hide" reads the boolean directly and decides for itself:

```tsx
const canGrant = useCan('admins.grant')
<Button disabled={!canGrant}>Permissions</Button>
```

Never add a `mode`/`disabled`/`tooltip` prop to `<Can>`. Hiding vs disabling vs read-only is the element's call, and pushing it into `<Can>` turns it into prop soup that still misses the next case.

Outside React (route `beforeLoad`, event handlers, non-hook helpers) use `can(permission)`, which reads the same store imperatively.

### Gating a nav item

Give the item a `permission` in `src/components/layout/data/sidebar-data.ts`; `AuthenticatedLayout` filters both lists before passing them to the shared shell, so the sidebar can never link to a page that would bounce to `/403`.

### It is UX only

All of the above hides things, it does not protect them. The backend gate (`RequireAdmin(...)` on each endpoint) is the real one. Assume any request can still come back `401` and handle it.

## Quick Reference

- **API client:** `apiClient` from `src/lib/api-client.ts` — never raw `axios`
- **API routes:** `ApiRoutes` in `src/lib/api-client.ts` — never hardcode URLs
- **Features:** `src/features/<name>/` with `api.ts`, `hooks.ts`, `types.ts`, `components/`, `index.tsx`
- **State:** Zustand stores in `src/stores/`, React Query for server state
- **Routing:** TanStack Router file-based routing in `src/routes/`
- **UI:** the shared components in `packages/ui` — never raw HTML elements. See the component table in `.agents/web/AGENTS.md`
- **Styling:** the tokens in `packages/ui/src/styles/theme.css` and nothing else. A raw palette colour (`bg-rose-100`) is an ESLint error. Sizes come from the type scale (`text-footnote`, `text-subhead`, `text-body`)
- **Env vars:** `import.meta.env` — NOT `process.env` or `NEXT_PUBLIC_`
- **Dialogs/popups:** must be polished — generous consistent padding, **per-field inline errors** under each input (RHF + zod + `FormMessage`, never one global error at the bottom), and file inputs are a **`react-dropzone` box**, never a bare `<input type="file">`
- **Never write a raw `<button>`, `<input>` or a bordered box.** Use `Button`, `ListRow`, `SegmentedControl`, `Field`, `Media`, `PhotoWell`/`FileRow`, `CloseButton`. If the shape you need does not exist, add a variant to the shared component; do not pass a className that restyles it.
- **Every dialog is `Modal` from `packages/ui/src/components/modal.tsx`**, with `ConfirmDialog` and `MessageDialog` as presets over it. It is deliberately NOT built on Radix's DismissableLayer: Radix Select/DropdownMenu/Popover always set `disableOutsidePointerEvents`, which makes any Radix dialog beneath them `pointer-events: none`, so a click inside falls through to the overlay and closes it. Because the Radix modal path no longer exists, a modal may contain any picker. Actions go in `ModalFooter` as `ModalAction` rows (`tone` default/brand/destructive, `emphasis`), never as hand-rolled buttons. `variant='alert'` is a small centred card; the default `sheet` fills a phone screen for forms.
- **There is no `notify`.** Every mutation/server error is displayed as meaningful inline text (extract the backend `message` via `parseApiError` from `@shared/ui/lib/error-dialog-store`), or handed to the global dialog with `useErrorDialog.getState().showError(error)`. Silent failures are unacceptable.
- **NEVER use dashes as punctuation anywhere**: no em dashes (U+2014), en dashes (U+2013), or spaced hyphen (`-`) in UI copy, labels, table cells, strings, comments, or commit messages. Restructure with a comma, colon, parentheses, or new sentence. Hyphens are fine only inside compound words and identifiers. A missing/empty table cell renders BLANK (`<span />` or `''`), never a dash placeholder.
- **Locale-sensitive queries must be tagged `meta: { localized: true }`:** the backend localizes responses via the `Accept-Language` header (sent automatically by `apiClient`), but TanStack Query keys aren't keyed by locale, so cached data doesn't refresh on a language switch by itself. `LanguageProvider` (`packages/ui/src/context/language-provider.tsx`) listens for `languageChanged` and calls `queryClient.invalidateQueries({ predicate: q => q.meta?.localized === true })`. Any new `queryOptions()` whose response contains backend-translated content (backend-translated labels, descriptions, etc.) MUST add `meta: { localized: true }` or it will keep showing stale-language data after a switch. Purely numeric/mock data (dashboard analytics, `admin/me`, `admin/sessions`) should NOT be tagged, to avoid needless refetches and UI flicker.

## Things to Avoid

- Do not use Next.js patterns (server components, App Router, `use server`, `next/` imports)
- Do not call `apiClient` directly in components — use hooks from `features/<name>/hooks.ts`
- Do not use arbitrary Tailwind colors — only CSS variable tokens
- Do not use `export default` — always named exports
- Do not use `interface` — use `type`
- Do not use arrow functions for components/hooks — use `function` keyword
- Do not use double quotes or semicolons
- Do not add docstrings or comments to unchanged code

## No comments (MANDATORY)

**Do not write comments.** Not above a component, not on a type member, not inside JSX, not to
justify a `useEffect`, not to name a section of a stylesheet. The code says what it does; explaining
it in prose beside it is noise the next reader has to scroll past. If something genuinely cannot be
understood without prose, say it in the reply instead.

This covers every comment form in every file of `web/`: `//`, `/* */`, JSDoc `/** */`, JSX
`{/* */}`, CSS `/* */` and HTML `<!-- -->`.

The **only** comments that may exist are these two, and nothing else ever qualifies:

1. **Tool directives** — a comment the compiler, linter or formatter reads and acts on:
   `// eslint-disable-line`, `// eslint-disable-next-line`, `/* eslint-disable */`,
   `// @ts-expect-error`, `// @ts-nocheck`, `/// <reference types="…" />`, `// prettier-ignore`.
   These are code, not commentary. Keep them, and never append prose to one — the rule name is the
   whole comment.
2. **The declaration separator** below.

Generated files are not ours to edit and are exempt: `apps/*/src/routeTree.gen.ts` is rewritten by
`tsr generate` on every typecheck.

## Declaration separator (MANDATORY)

Every declaration at the top level of a `.ts`, `.tsx` or `.js` file — and every member of a class —
MUST be preceded by this exact two-line separator. In a file holding several types or components, the
separator is what visually separates them:

```
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
```

Rules:

- Exactly **two** lines, each **105** `/` characters — nothing more, nothing less.
- **Only** `/` characters. No text, no dashes, no other characters. Nothing between the two lines.
- **Indent the separator to match the declaration it precedes.** Top-level declarations → column 0.
  Class members → indented to the member's level (2 spaces). The `/` count stays 105; only leading
  whitespace changes.
- Placed **directly above the declaration**, above its `export` keyword and above any decorator.

It applies to **every** top-level declaration, whatever its kind:

```tsx
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const SEARCH_DELAY = 400

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export type ComboboxOption = {
  value: string
  label: string
  description?: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export const Route = createFileRoute('/checkout')({ component: Checkout })

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function ItemCard({ item }: ItemCardProps) {
  return <article>{item.name}</article>
}
```

Class member (separator indented to match the member):

```ts
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
class ApiClient {
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  async refresh() {}
}
```

Where it does **not** go:

- Never before `import` or a bare re-export (`export * from …`, `export { x } from …`).
- Never before a member **inside** a type, interface, object literal or enum — the separator marks
  the declaration, not its fields.
- Never inside a function or component body: a local `const`, a nested helper and a local
  sub-component defined inside another function take none.
- Never above a file-level `/// <reference … />`. That directive must stay on the file's first
  line; the separator for the first declaration goes **below** it.
- Never before a member **inside** a `declare module` augmentation block — the `declare module`
  itself takes the separator, the interfaces it augments do not.
- Never in `.css`, `.html` or `.json`. Those files have no declarations, and `//` is not a comment
  in CSS.
- **Never between a tool directive and the code it governs.** `// eslint-disable-next-line` must
  stay on the line directly above its target, so the separator goes **above the directive**:

```tsx
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// eslint-disable-next-line react-refresh/only-export-components
export function useSidebar() {}
```

- Do **not** use any other divider style (`// ---- //`, `/* ===== */`, shorter or longer `/` runs,
  section-label comments between separators).

## Never wait (MANDATORY)

Never run anything that blocks: no `sleep`, no polling loop, no waiting for something to become
ready. The user is watching, and waiting is never acceptable.

If a command does not return quickly, kill it and take the fast way out instead of diagnosing while
it hangs.

## Copy the neighbour before inventing a control (MANDATORY)

Before building any control, **open the nearest screen that already does the same job and copy it**.
A status filter on one table must look and be built exactly like the status filter on the next
table. Search for an existing use first; do not design a second version of a thing that already
exists.

If the shape genuinely does not exist yet, build it from the shared styles the design system already
exports (`fieldVariants`, the `Button` variants, `Field`, `ListRow`, `SegmentedControl`) so it
inherits the same look. Never assemble a control out of raw elements, and never out of a
default-styled `Button`, hoping it will match.

Concretely, never:

- reach for a bare `<button>`, `<input>`, `<select>` or a hand-rolled bordered box
- restyle a shared component through `className` at the call site instead of adding a variant to it
- write a one-off control that duplicates, but does not match, one that already ships
