# Client — SaaS Template

## Business

This is a reusable starter template, not a client project yet. When a real project adopts it,
replace this file with that client's business context: what the product is, who uses it, and what
each app is for.

## Technical Level

Technical. The client reviews code and understands engineering decisions.

## Primary Goal

Ship a working foundation: a public user site with full account flows, and an admin dashboard that
manages users, admins and their permissions, and the app configuration.

## Brand & Tone

- Apple/iOS look on every surface, never generic dashboard defaults
- shadcn/ui new-york style with dark mode support
- Clean, restrained, information-dense where it matters

## Primary Color

`--brand` in `packages/ui/src/styles/theme.css`: `#007aff` light, `#0a84ff` dark. Rebranding a new
project means changing those two pairs (`--brand` + `--ring`) and the logo assets, nothing else.

## Active Modules

- **User site** (`apps/user`) — home, sign in/up, forgot/reset password, and the signed-in account
  area (profile, email, security and devices, appearance, language, legal)
- **Admin dashboard** (`apps/admin`) — dashboard, users, admins with permission grants, settings
  (profile, email, picture, security and devices, app config, appearance, language, legal)
