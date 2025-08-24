FROM node:20.16.0-alpine AS deps
WORKDIR /workspace
ENV PNPM_HOME=/usr/local/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN apk add --no-cache git && npm i -g pnpm@10.9.0

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY src/apps/backend/package.json src/apps/backend/package.json
COPY src/libs/common/package.json src/libs/common/package.json

RUN pnpm -w install --filter backend... --prod --frozen-lockfile


FROM node:20.16.0-alpine AS builder
WORKDIR /workspace
ENV PNPM_HOME=/usr/local/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN apk add --no-cache git && npm i -g pnpm@10.9.0

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY src/apps/backend/package.json src/apps/backend/package.json
COPY src/libs/common/package.json src/libs/common/package.json

RUN pnpm -w install --filter backend... --frozen-lockfile

COPY src/libs/common src/libs/common
COPY src/apps/backend src/apps/backend

RUN pnpm -w --filter common build \
  && pnpm -w --filter backend build


FROM node:20.16.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

USER node

COPY --from=deps --chown=node:node /workspace/src/apps/backend/node_modules ./node_modules
COPY --from=builder --chown=node:node /workspace/src/apps/backend/dist ./dist
COPY --from=builder --chown=node:node /workspace/src/apps/backend/package.json ./package.json

EXPOSE 3000
CMD ["node","dist/main.js"]
