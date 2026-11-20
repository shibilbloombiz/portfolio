# Multi-stage Dockerfile for BloomBiz Portfolio & CMS
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build frontend
COPY . .
RUN npm run build

# Production runtime stage
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend, server, and assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/public ./public

# Ensure upload and data directories exist
RUN mkdir -p /app/public/uploads /app/server/data

EXPOSE 5000

CMD ["node", "server/index.cjs"]
