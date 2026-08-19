# Email Templates — Backend Guide

## Setup

```bash
pnpm install
```

## Commands

```bash
pnpm dev              # Preview at http://localhost:3000
pnpm export:backend   # Export + copy templates into ../backend/app/templates/emails/
```

## Export to Backend

`pnpm export:backend` does everything:

1. Exports every template to `out/`
2. Copies each into `../backend/app/templates/emails/`, converting kebab-case → snake_case and overwriting the old file

No manual copying and no manual Jinja editing — the `{{ variables }}` are already in the exported HTML because they're the prop defaults in each `.tsx`. If you add a new token, add the matching key to the context in `backend/app/services/notification/notification_service.py`.

## Create New Template (Claude Code)

```
claude
/create
```

Prompts for: template name, Figma light mode link, optional dark mode link. Generates a complete template matching the Figma design with light/dark mode support.
