FROM node:20-slim AS base

# Install curl and poppler-utils for healthcheck and PDF rendering
RUN apt-get update && apt-get install -y curl poppler-utils && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --legacy-peer-deps

# Build
FROM base AS builder
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps
COPY . .
ENV GROQ_API_KEY="dummy_key_for_build"
RUN npm run build

# Production
FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/data ./data
COPY --from=builder /app/samples ./samples
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/db ./db

EXPOSE 3000
CMD ["npm", "start"]
