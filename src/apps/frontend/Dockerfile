FROM node:20.16.0-alpine AS builder
WORKDIR /workspace
ENV PNPM_HOME=/usr/local/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN apk add --no-cache libc6-compat git && npm i -g pnpm@10.9.0

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY src/apps/frontend/package.json src/apps/frontend/package.json
COPY src/libs/common/package.json src/libs/common/package.json
COPY src/libs/common-ui/package.json src/libs/common-ui/package.json

RUN pnpm -w install --filter frontend... --frozen-lockfile

COPY src/libs/common src/libs/common
COPY src/libs/common-ui src/libs/common-ui
COPY src/apps/frontend src/apps/frontend

RUN pnpm -w --filter common build \
  && pnpm -w --filter common-ui build \
  && pnpm -w --filter frontend build


FROM node:20.16.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

USER node

COPY --from=builder --chown=node:node /workspace/src/apps/frontend/.next ./.next
COPY --from=builder --chown=node:node /workspace/src/apps/frontend/node_modules ./node_modules
COPY --from=builder --chown=node:node /workspace/src/apps/frontend/package.json ./package.json
COPY --from=builder --chown=node:node /workspace/src/apps/frontend/next.config.ts ./next.config.ts
COPY --from=builder --chown=node:node /workspace/src/apps/frontend/public* ./public

CMD ["node","node_modules/next/dist/bin/next","start","-p","3000"]
