###########################
# Stage 1: Builder
###########################
FROM node:20-slim AS builder
WORKDIR /app

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy package files & lockfile separately for caching
COPY package*.json* pnpm-lock.yaml* ./
RUN pnpm install

# Copy remaining source code and build
COPY . ./
RUN pnpm build

###########################
# Stage 2: Production
###########################
FROM node:20-slim AS runner
WORKDIR /app

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy package files and lockfile to install only production deps
COPY package*.json* pnpm-lock.yaml* ./
RUN pnpm install --prod

# Copy built files and environment configuration from builder
COPY --from=builder /app/dist ./dist
COPY .env ./

EXPOSE 8888

CMD ["node", "dist/index.js"]