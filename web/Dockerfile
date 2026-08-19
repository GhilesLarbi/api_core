FROM public.ecr.aws/docker/library/node:22-slim AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Manifests first: the install layer is reused whenever only source changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ui/package.json packages/ui/
COPY apps/admin/package.json apps/admin/
COPY apps/user/package.json apps/user/
RUN pnpm install --frozen-lockfile

COPY settings.ts ./
COPY packages/ui packages/ui

# =================================================================
# =================================================================
FROM base AS user
COPY apps/user apps/user
CMD ["pnpm", "--filter", "@shared/user", "start"]

# =================================================================
# =================================================================
FROM base AS admin
COPY apps/admin apps/admin
CMD ["pnpm", "--filter", "@shared/admin", "start"]
