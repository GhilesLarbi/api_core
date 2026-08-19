# SaaS Template Web — Claude Code Instructions

A **pnpm workspace** holding every browser-facing app. Both are **Vite SPAs** with TanStack Router, NOT Next.js.

Read all context files before starting any task.

## Context

- [Client](context/client.md) — business context, modules, brand
- [Conventions](context/conventions.md) — coding rules, patterns, data fetching
- [User](user/AGENTS.md) — user app
- [Admin](admin/AGENTS.md) — admin dashboard

`context/` is shared by every app and lives here, not inside them. Anything true of only one app belongs in that app's file under `.agents/web/`.

## Layout

```
web/
  context/         shared docs, read by both apps
  apps/user/       user app        → example.com       → :3000
  apps/admin/      admin dashboard → admin.example.com → :3002
  packages/ui/     shared design system, imported as @shared/ui
```

## The shared package

`packages/ui` holds **everything visual**: shadcn primitives, theme tokens, the whole layout shell, providers, generic dialogs and uploads. It is consumed as raw TypeScript with no build step — Vite transpiles it, and HMR crosses the package boundary.

```ts
import { Button } from '@shared/ui/components/button'
import { AuthenticatedLayout } from '@shared/ui/components/layout/authenticated-layout'
import { cn } from '@shared/ui/lib/utils'
```

### The components you build with

Reach for these before writing markup. If one does not fit, add a variant to it
rather than a className at the call site.

|                                      |                                                                                                                                                    |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                             | every button. `variant` default/brand/destructive/tinted/secondary/outline/ghost/plain/link, `size` xs..xl + icon sizes, `block`, `shape='circle'` |
| `ListRow`                            | a tappable row in a grouped list: leading glyph, label, description, `trailing`, `chevron`                                                         |
| `SegmentedControl`                   | a 2-3 option toggle. The selection is a raised pill, never a tinted one                                                                            |
| `Field`                              | one form field, one line. Reads `control` from context                                                                                             |
| `DataTable`                          | every table: URL-driven sort, pagination pinned at the bottom, side-panel row click                                                                |
| `Modal` + `ModalAction`              | every dialog. `variant='alert'` for a small centred card, `sheet` for a form                                                                       |
| `SidePanel`                          | the trailing inspector column, a modal below `lg`                                                                                                  |
| `Media` / `MediaPair`                | every picture: `kind` person/brand/document                                                                                                        |
| `PhotoWell` / `FileRow` / `FileRows` | every upload                                                                                                                                       |
| `CloseButton`                        | the one dismiss control                                                                                                                            |
| `JoinedGroup`                        | controls joined into one block: hairline seams, only the outer corners rounded                                                                     |
| `Combobox`                           | a Select you can type into. Filters locally by default; give it `onSearch` and `onEndReached` for a paged source                                   |

### Joining controls into one block

`JoinedGroup` is every stacked block: a settings group, a toolbar's field plus
filter, a row of documents, the Back/Next pair. It does **not** shape its
children with CSS. It hands each one a **seat** through React context, and the
child rounds itself:

```tsx
import { useJoinedSeat } from '@shared/ui/hooks/use-joined-seat'

export function MyControl({ className }: { className?: string }) {
  // The corners this control owns, or null when it is standing on its own.
  const seat = useJoinedSeat()

  return (
    <div
      className={cn('bg-muted px-4 py-3', seat ?? 'rounded-xl', className)}
    />
  )
}
```

Two rules, and adding a control to a group needs nothing else:

1. **Every control has its own shape** (`seat ?? 'rounded-xl'`). A control that
   only looks right inside a group is broken the first time someone uses it
   alone, which is exactly how the admin's document rows ended up square.
2. **A control that took a seat closes it behind itself** with
   `JoinedSeatBoundary`, so a reveal button or a trailing action it renders
   does not take the same corner.

A seat is read from **inside** the group, so a raw `<button>` or `<Link>`
written inline in the group's JSX cannot read one: give it its own small
component, the way `AttachmentRow` and `LegalRow` do. The group still clips, so
a child that takes no seat is rounded anyway and only its focus ring goes
square, never the block.

Why context and not CSS: a selector can only find a child by its shape in the
tree, and the tree is never what it looks like. A field arrives wrapped in its
`FormItem`, a password field in a positioning div, a file row in a wrapper of
its own. Every `> :first-child` rule is a guess that survives until someone adds
a wrapper, and clipping the group instead hides the miss while cutting focus
rings square at the corner.

**The rule: `packages/ui` renders, the app supplies the data.** A shared component never reaches for a store, `ApiRoutes`, or an app type — it takes props. Where an app needs to inject its own data, it keeps a **same-named wrapper** under `apps/<app>/src/components/` so feature code's import path never changes:

| app file                                                       | what it injects                                            |
| -------------------------------------------------------------- | ---------------------------------------------------------- |
| `layout/authenticated-layout.tsx` · `layout/public-layout.tsx` | `sidebarData`, `<AppTitle/>`, the signed-in avatar         |
| `layout/app-title.tsx` · `layout/data/sidebar-data.ts`         | this app's brand and navigation                            |
| `sign-out-dialog.tsx`                                          | this app's auth store                                      |
| `lib/api-client.ts` · `lib/config.ts`                          | this app's API surface                                     |
| `services/use-storage.ts`                                      | the uploader passed to `PhotoWell` / `FileRow` as `upload` |

**Translations follow the component.** A shared component's copy ships with it: `common`, `dashboard` and `nav.skipToMain` live in `packages/ui/src/locales/`. Each app's `i18n/config.ts` calls `withSharedResources()`, which layers the app's own namespaces on top and deep-merges anything sharing a name — that is how an app adds `nav.brand` and `nav.items` to the shared `nav`. Never copy a key a shared component reads into an app locale file; it will silently drift and the component will render the raw key.

- **Edit a component or a theme token once** and both apps change.
- Routes, stores, services and app-specific i18n stay in the app. Features that render the same thing in every app do NOT: `features/dashboard`, `features/errors`, `features/legal` and the settings shell live in `packages/ui/src/features/` and take what differs as props. A shared feature still never imports `@/` — where it needs the app's auth, navigation or shell it takes a prop or a slot (`SettingsNav`'s `groups` and `signOutDialog`).
- `@shared/ui` declares its own dependencies. Adding an import to a package file means adding that dependency to `packages/ui/package.json`, not to an app.
- Nothing unreachable from `main.tsx` should exist in either place. If a component stops being used, delete it — shadcn primitives come back with one `shadcn add`.

## Working in the workspace

Every command runs from `web/`:

|                                    |                                         |
| ---------------------------------- | --------------------------------------- |
| `pnpm install`                     | one install, all apps and packages      |
| `pnpm dev`                         | both dev servers in parallel            |
| `pnpm --filter @shared/admin dev` | one app                                 |
| `pnpm typecheck` / `pnpm build`    | every workspace package                 |
| `pnpm lint` / `pnpm format`        | whole workspace, one config at the root |

ESLint, Prettier, and their ignore files live at `web/` and cover everything. Do not add per-app copies.

`pnpm dlx shadcn@latest add <component>` run inside an app installs the primitive into `packages/ui` and rewrites the import — that is what each app's `components.json` aliases are for.

## Configuration — `web/settings.ts`

There is **no `.env` anywhere under `web/`** and no `VITE_*` variable to set. `web/settings.ts` reads `ENVIRONMENT` (`PRODUCTION` / `STAGING` / `LOCAL`, defaulting to `LOCAL`) from the process and exports the values that depend on it, mirroring `backend/app/core/settings.py`. `ENVIRONMENT` itself comes from the repo-root `.env`, which compose passes to every service.

It also exports a `define` object that each `vite.config.ts` spreads into its config, so `import.meta.env.VITE_API_URL` is substituted at build time and app code keeps reading it through `lib/config.ts` unchanged.

| ENVIRONMENT | `VITE_API_URL` becomes |
| ----------- | ---------------------- |
| `LOCAL` | `http://localhost:8000` |
| `STAGING` | `https://api.staging.example.com` |
| `PRODUCTION` | `https://api.example.com` |

A new value that differs per environment is **a field in `settings.ts`**, never a new file and never an env var. Secrets never go here: this file's contents are compiled into a browser bundle and are therefore public.

## Docker

`web/Dockerfile` is multi-stage: a `base` stage holds the manifests, the one `pnpm install --frozen-lockfile`, `settings.ts` and `packages/ui`; then a `user` and an `admin` stage each copy only their own app directory and own their `CMD`. Compose picks one with `target:` per service, so no service passes a `command:`. The two images share the install layer and differ by roughly 900 kB.

Each stage's `CMD` is `pnpm --filter @shared/<app> start`, and that `start` script is the environment switch:

```json
"start": "if [ \"$ENVIRONMENT\" = LOCAL ]; then pnpm dev; else pnpm build && pnpm preview; fi"
```

`LOCAL` runs the vite dev server; anything else builds and serves the result with `vite preview`, whose SPA fallback is what makes deep links work — no rewrite file or extra server is involved. `vite preview` reads the **`preview`** block in `vite.config.ts`, not `server`, so both blocks carry the same `host` / `port` / `allowedHosts`; without `preview` it would bind localhost on port 4173.

`mem_limit` on these services is **1g**. The build OOM-kills at 512m; 768m is the measured floor.

Each service mounts `./web:/app`, which shares the **source** — that is why editing `packages/ui` hot-reloads both apps.

`node_modules` is not shared through that mount. pnpm puts one in each package, and the bind mount would hide the ones the image installed, so every service also mounts four **named** volumes over them (`web_node_modules`, `web_admin_node_modules`, `web_user_node_modules`, `web_ui_node_modules`). They are named and shared by both services on purpose: as anonymous volumes each container got its own copy, frozen at the moment it was first created, so the two drifted apart and a dependency added later was invisible to both of them.

`web-deps` is a one-shot service — built from the `base` stage as `web-base:latest` — that runs `pnpm install --frozen-lockfile` into those volumes and exits; the two dev servers wait on it with `service_completed_successfully`. It exists because the volumes are shared: two dev servers each running their own install would race on the same directory. It re-runs on every `docker compose up`.

**After ANY edit to a `package.json` — adding a dependency, removing one, changing a version or a
package name — run the install in the same change, never later:**

```bash
pnpm install                 # from web/, updates pnpm-lock.yaml
docker compose up -d web-admin web-user
```

The host install is what updates the lockfile; `web-deps` is deliberately `--frozen-lockfile` so a lockfile that disagrees with a manifest fails loudly instead of drifting. **Do not** rebuild the image for this — the rebuild updates the image while the running container keeps its existing volume, which is exactly the trap that makes a dependency look installed everywhere except where it runs.

**Removing a dependency is the case that gets forgotten.** `pnpm typecheck`, `pnpm build` and `pnpm lint`
all keep passing on your machine, because the package is still sitting in `node_modules`; nothing
tells you the lockfile is now stale. The failure surfaces later, for someone else, as
`ERR_PNPM_OUTDATED_LOCKFILE` from `web-deps` on `docker compose up`, and it takes the whole web stack
down with it. Commit `pnpm-lock.yaml` alongside every `package.json` edit — a diff that touches one
without the other is wrong.

Two things worth knowing when this misbehaves:

- pnpm decides it is up to date from `node_modules/.pnpm-workspace-state-v1.json`. A changed manifest or lockfile invalidates it and the install runs; a **hand-deleted package does not**, and `pnpm install` will report "Already up to date" while the tree stays broken (`--force` included). Delete that file to force a real install.
- Renewing the volumes (`docker compose up -d --renew-anon-volumes`) is no longer part of any normal workflow. If you ever do need to start clean, `docker compose down -v` drops the named volumes too, including the database.

## Things to Avoid

- Do not use Next.js patterns (server components, App Router, `use server`, `next/` imports)
- Do not add a second lockfile, workspace file, or `node_modules` below `web/`
- Do not add a `.env` file or a `VITE_*` variable — environment-dependent values belong in `web/settings.ts`
- Do not put a `command:` on a web service in compose — the app's Dockerfile stage owns its `CMD`
- Do not import across apps (`apps/admin` must never reach into `apps/user`) — promote to `packages/ui` instead
- Do not put app state, API routes, or business logic in `packages/ui`
- Do not duplicate an ESLint or Prettier config into an app
- Do not export a hook, a context or a `cva` variant from a file that also exports a component. A mixed module is not a Fast Refresh boundary, so editing it reloads the whole app instead of swapping that component in place. Variants live in `packages/ui/src/lib/*-variants.ts`, a context and its hook in `packages/ui/src/hooks/use-*.ts`, pure helpers in `packages/ui/src/lib/`. Note that `packages/ui/package.json` maps `./components/*` to `.tsx` only, so a `.ts` file under `components/` will typecheck and then fail to resolve at build time

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
export const Route = createFileRoute('/settings')({ component: Settings })

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function ProfileCard({ profile }: ProfileCardProps) {
  return <article>{profile.name}</article>
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
