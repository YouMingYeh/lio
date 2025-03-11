FROM node:20-alpine AS base

# Install necessary dependencies in base image
RUN apk update && apk add --no-cache libc6-compat
RUN npm install -g pnpm@latest

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

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the source code
COPY --from=builder /app/out/full/ .

# Build the project
RUN pnpm turbo run build --filter=cron

# Start the server
CMD ["node", "dist/index.js"]