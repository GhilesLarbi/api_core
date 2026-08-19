# Conventions — Vite + TanStack Router + React Query + shadcn/ui

Stack: Vite 8 · React 19 · TanStack Router · TanStack Query 5 · Axios · shadcn/ui · Tailwind CSS 4 · Zod 4 · React Hook Form · Zustand 5

**This is a Vite SPA, NOT Next.js.** No server components, no App Router, no `use server` / `use client`, no `next/` imports, no `NEXT_PUBLIC_` env vars.

---

## File layout order

1. Imports
2. Types / constants
3. **Main exported component** (always before sub-components)
4. Local sub-components (below the main export)

## Component splitting

Keep everything in one file unless ALL three are true:

1. 200+ lines
2. Independent data fetching (its own `useQuery` to a different endpoint)
3. Meaningfully reusable or unrelated in concern

If multiple sub-components share one `useQuery` — keep them in the same file.

## Popover / Modal — Content sub-component

Whenever a `Popover`, `Dialog`, or `AlertDialog` contains hooks or logic, extract the inner content into a co-located `Content` sub-component in the **same file**. The parent only owns open/close state. This ensures hooks and heavy logic only run when the overlay is actually open.

```tsx
// correct — hooks live in Content, only mount when open
export function DeleteUserDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='destructive'>Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <Content onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function Content({ onClose }: { onClose: () => void }) {
  const deleteUser = useMutation({ mutationFn: () => apiClient.delete(ApiRoutes.users.delete(id)) })
  // all logic here
}

// wrong — hooks run unconditionally in the parent
export function DeleteUserDialog() {
  const deleteUser = useMutation(...) // runs even when dialog is closed
  const [open, setOpen] = useState(false)
  ...
}
```

## Route files

Route files in `src/routes/` import and render feature page components. No data fetching or inline logic in route files — delegate to the feature's `index.tsx`.

## UI components — always use shadcn

Always reach for an existing shared component before writing any custom UI. Never build a raw HTML element when one covers it. The full list is in `.agents/web/AGENTS.md`; if the shape you need does not exist, add a variant to the shared component rather than a className at the call site.

**Rules:**

- Use `Button` — never `<button>`
- Use `size='icon'` on `Button` whenever the button contains only an icon and no label
- Use `Input` — never `<input>`
- Use `ListRow` for a tappable row, `FieldGroup` for a group of fields
- Use `Modal` for anything modal, `ConfirmDialog` for a yes/no, `MessageDialog` to tell the reader something
- Use `Skeleton` for loading states — never a custom spinner (use `Spinner` only for inline/button loading)
- Use `Badge` for status labels
- Use `DropdownMenu` for action menus
- If a component you need is not installed, add it with `pnpm dlx shadcn@latest add <component>` — do not build it from scratch

## Feature-based architecture

Each feature is a self-contained module under `src/features/<name>/`:

```
features/
  dashboard/
    api.ts          # Standalone fetch functions + queryOptions() factories
    hooks.ts        # React hooks (useQuery/useMutation wrappers)
    types.ts        # TypeScript types for this feature
    components/     # UI components for this feature
    index.tsx       # Page component
```

**Rules:**

- One feature per folder under `src/features/`
- Never call `apiClient` directly in a component — always go through a hook in `hooks.ts`
- Before adding a new API route, check `ApiRoutes` in `lib/api-client.ts` and add there first
- If a feature already has `api.ts` / `hooks.ts` / `types.ts`, add to the existing file — don't create new ones

## Data fetching pattern (queryOptions + hooks)

### api.ts — fetch functions + queryOptions factories

```tsx
import { queryOptions } from '@tanstack/react-query'

import { apiClient, ApiRoutes } from '@/lib/api-client'

import { type MyResponse } from './types'

// Standalone fetch function — async function declaration
export async function fetchMyData(params: MyParams): Promise<MyResponse> {
  const { data } = await apiClient.get<MyResponse>(ApiRoutes.resource.list, {
    params,
  })
  return data
}

// queryOptions factory — arrow function
export const myDataQueryOptions = (params: MyParams) =>
  queryOptions({
    queryKey: ['resource', params] as const,
    queryFn: () => fetchMyData(params),
    retry: false,
    staleTime: 30 * 1000,
    placeholderData: (prev: MyResponse | undefined) => prev,
  })
```

### hooks.ts — thin wrappers around queryOptions/mutations

```tsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { deleteMyData, myDataQueryOptions } from './api'

export function useMyData(params: MyParams) {
  return useQuery(myDataQueryOptions(params))
}

export function useDeleteMyData() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMyData(id),
    meta: { skipGlobalError: true },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource'] })
    },
  })
}
```

**Rules:**

- Always use `as const` on query keys
- Always set `retry: false` on individual queryOptions
- Use `placeholderData: (prev) => prev` when paginated data should persist between pages
- Use `meta: { skipGlobalError: true }` on mutations that handle their own errors
- No `.catch()` chains with custom `ApiError` — errors are handled globally by `handleServerError` in `main.tsx`
- `queryOptions()` factories are arrow functions
- Standalone fetch functions are `async function` declarations

## External API pattern (Axios)

**One file: `lib/api-client.ts`** — axios instance + ApiRoutes object. Auth is a Bearer access token read from `useAuthStore`, with a single-flight 401 refresh via the OAuth2 refresh-token grant.

```tsx
import axios from 'axios'

import { useAuthStore } from '@/stores/auth-store'

export const apiClient = axios.create({ baseURL: apiBaseUrl })

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

export const ApiRoutes = {
  userAuth: {
    login: '/api/v1/user/login',
    me: '/api/v1/user/me',
  },
} as const
```

**Rules:**

- Always use `apiClient` for API calls — never raw `axios`
- Never hardcode URL strings — always use `ApiRoutes`
- Route builders use static strings for simple endpoints and functions for parameterized endpoints
- `ApiRoutes` is typed `as const`, grouped by resource (`userAuth`, `users`, `dashboard`, ...)
- The `Authorization: Bearer <token>` header is injected automatically by the request interceptor
- A 401 triggers a single in-flight refresh (`refreshAccessToken`); on refresh failure the auth store is cleared and the router redirects to `/login`

## Forms

Always use React Hook Form + Zod. Never use uncontrolled inputs or `useState` for form state.

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({ email: z.string().email() })
type FormValues = z.infer<typeof schema>

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<FormValues>({
  resolver: zodResolver(schema),
})
```

- Schema always defined with Zod, co-located with the form component
- Submit button uses `isPending` from the mutation — show `<Spinner />` inside it

## Loading and error states

- Use `<Skeleton />` for initial data loading (page-level, list-level)
- Use `<Spinner />` only for inline actions (inside buttons, small inline areas)
- Never show a blank screen — always render a skeleton that matches the layout
- For errors: inline text next to the action, or `useErrorDialog` for anything with no better home

## Errors

There is no toast layer. An error is either shown where the action happened, or
handed to the global dialog.

```tsx
import {
  parseApiError,
  useErrorDialog,
} from '@shared/ui/lib/error-dialog-store'

// inline, next to the thing that failed
setError(parseApiError(error).message)

// or the app-wide dialog, for anything with no better home
useErrorDialog.getState().showError(error)
```

- Form errors are per field, under the input, via `Field`'s `FormMessage`
- A mutation that shows its own error sets `meta: { skipGlobalError: true }`
- Never `alert()`, and never swallow an error silently

## Tailwind utilities

- Always use `dvh` for viewport height — never `vh`
- Always use `size-*` when width and height are equal — never `w-* h-*`
- Always use the `!` important suffix at the **end** of a class — never the `!` prefix

```tsx
// correct
<div className='min-h-dvh' />
<div className='size-6' />
<div className='mb-0!' />

// wrong
<div className='min-h-screen' />
<div className='h-6 w-6' />
<div className='!mb-0' />
```

## Color tokens

**Never use arbitrary Tailwind colors.** No `text-gray-500`, no `bg-blue-600`. Always use shadcn CSS variable tokens.

| Token                                            | Usage                                          |
| ------------------------------------------------ | ---------------------------------------------- |
| `bg-background` / `text-foreground`              | Page background and default text               |
| `bg-card` / `text-card-foreground`               | Card surfaces                                  |
| `bg-popover` / `text-popover-foreground`         | Popovers, dropdowns                            |
| `bg-primary` / `text-primary-foreground`         | Primary actions, active state                  |
| `bg-secondary` / `text-secondary-foreground`     | Secondary actions                              |
| `bg-muted` / `text-muted-foreground`             | Subtle backgrounds, placeholder text, captions |
| `bg-accent` / `text-accent-foreground`           | Hover states, highlights                       |
| `bg-destructive` / `text-destructive-foreground` | Errors, delete actions                         |
| `border`                                         | Default borders                                |
| `ring`                                           | Focus rings                                    |
| `input`                                          | Input borders                                  |

## Dates — always use date-fns

Never use `new Date().toLocaleDateString()`, `toLocaleString()`, or any native `Intl.DateTimeFormat` for formatting. Always use `date-fns`.

```tsx
import { format, formatDistanceToNow, parseISO } from 'date-fns'

format(new Date(isoString), 'MMM d, yyyy')
formatDistanceToNow(new Date(isoString), { addSuffix: true })
parseISO(isoString)
```

- Always import individual functions — never import the full library
- Use `parseISO` when parsing date strings from the API
- Always handle null/undefined dates with a `'—'` fallback before formatting

## Coding rules

| Rule         | Convention                                                               |
| ------------ | ------------------------------------------------------------------------ |
| Functions    | `function MyComp()` — use `function` keyword, not arrow functions        |
| Exports      | Named exports only — never `export default`                              |
| File names   | `kebab-case.tsx`                                                         |
| Quotes       | Single quotes — `'value'`                                                |
| Semicolons   | None                                                                     |
| Type imports | `import { type Foo }` — inline type-only imports (ESLint enforced)       |
| Types        | `type Foo = {}` — never `interface Foo {}`                               |
| className    | Always use `cn()` from `@shared/ui/lib/utils` — never template literals |
| Comments     | None. Only tool directives and the declaration separator — see below     |

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
