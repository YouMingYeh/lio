FROM node:20-alpine AS base

# Install necessary dependencies in base image
RUN apk update && apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

FROM base AS builder
WORKDIR /app
# Install Turbo globally for monorepo management
RUN npm install -g turbo
COPY . .

# Prune the monorepo for cron package
RUN turbo prune cron --docker

FROM base AS installer
WORKDIR /app

# Copy pruned package.json and lockfile
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install dependencies using pnpm - explicitly include dev dependencies
RUN --mount=type=cache,mode=0777,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Copy the source code
COPY --from=builder /app/out/full/ .

# Build the project
RUN pnpm turbo run build --filter=cron

FROM node:20-alpine AS runner
WORKDIR /app

# Copy the built files
COPY --from=installer /app .

# Start the server
CMD ["node", "apps/cron/dist/index.js"]