FROM public.ecr.aws/docker/library/node:22-slim AS base

# Run as a fixed non-root user so files written through the bind mount
# (build caches, generated files) stay owned by the host user, not root.
RUN groupadd -g 1001 web && useradd -u 1001 -g web -m web \
    && mkdir /app && chown web:web /app
WORKDIR /app

# Corepack's pnpm download is baked into the image at a fixed, non-root path so
# the runtime user never re-downloads it (the default cache lives under $HOME).
ENV COREPACK_HOME=/corepack
RUN corepack enable && corepack prepare pnpm@latest --activate \
    && chown -R web:web /corepack

# Fixed store path so the build cache mount below survives rebuilds.
ENV pnpm_config_store_dir=/pnpm-store

USER web

# Manifests first: the install layer is reused whenever only source changes.
COPY --chown=web:web package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=web:web packages/ui/package.json packages/ui/
COPY --chown=web:web apps/admin/package.json apps/admin/
COPY --chown=web:web apps/user/package.json apps/user/
RUN --mount=type=cache,id=pnpm-store,uid=1001,gid=1001,target=/pnpm-store \
    pnpm install --frozen-lockfile

COPY --chown=web:web settings.ts ./
COPY --chown=web:web packages/ui packages/ui

# =================================================================
# =================================================================
FROM base AS user
COPY --chown=web:web apps/user apps/user
CMD ["pnpm", "--filter", "@shared/user", "start"]

# =================================================================
# =================================================================
FROM base AS admin
COPY --chown=web:web apps/admin apps/admin
CMD ["pnpm", "--filter", "@shared/admin", "start"]
