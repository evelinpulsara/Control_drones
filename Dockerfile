# syntax=docker/dockerfile:1.6

# =============================================================================
# AgriDrone - Multi-stage Dockerfile
# Stack: Next.js (frontend) + gRPC over HTTP/2 (backend telemetry)
# Targets: Render, Fly.io, and any HTTP/2-capable cloud platform.
#
# Stage layout:
#   1. builder-grpc  -> compile TypeScript backend (tsc)
#   2. builder-web   -> build Next.js frontend (standalone output)
#   3. runner        -> minimal Alpine runtime with both artifacts
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build the gRPC backend
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder-grpc

WORKDIR /app/backend

# Install dependencies first (cached layer, only rebuilds if package.json changes)
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy proto contracts and TypeScript source, then compile
COPY protos ./protos
COPY src ./src
RUN npm run build

# Strip devDependencies (TypeScript is dev-only; runtime only needs @grpc/*)
RUN npm prune --omit=dev

# -----------------------------------------------------------------------------
# Stage 2: Build the Next.js frontend (standalone output)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder-web

WORKDIR /app/web

ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies first (cached layer)
COPY web/package*.json ./
RUN npm ci

# Copy the rest of the frontend source and build.
# next.config.mjs has output:"standalone", producing .next/standalone/
COPY web/ ./
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 3: Minimal production runtime
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# tini: proper PID 1 signal handling and zombie process reaping
RUN apk add --no-cache tini && \
    addgroup -S app && \
    adduser -S app -G app

# ---- gRPC backend artifacts ------------------------------------------------
# @grpc/grpc-js is pure JavaScript, so no native compilation is required and
# HTTP/2 + binary protobuf streaming work out of the box on Node's http2 core.
RUN mkdir -p /app/backend
COPY --from=builder-grpc --link /app/backend/package*.json ./backend/
COPY --from=builder-grpc --link /app/backend/node_modules ./backend/node_modules
COPY --from=builder-grpc --link /app/backend/dist ./backend/dist
COPY --from=builder-grpc --link /app/backend/protos ./backend/protos

# ---- Next.js frontend (standalone output) ----------------------------------
RUN mkdir -p /app/web
COPY --from=builder-web --link /app/web/.next/standalone ./web/
COPY --from=builder-web --link /app/web/.next/static ./web/.next/static
COPY --from=builder-web --link /app/web/public ./web/public

# ---- Startup script --------------------------------------------------------
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# ---- Environment -----------------------------------------------------------
# PORT is honoured by Render / Fly.io for the web frontend.
# GRPC_PORT is the host:port the gRPC (HTTP/2) server binds to.
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    GRPC_PORT=0.0.0.0:50051

USER app

# Next.js frontend (HTTP/1.1) and gRPC MonitoreoFlota (HTTP/2 binary streams)
EXPOSE 3000 50051

# Healthcheck: HTTP liveness probe for the web frontend.
# gRPC speaks HTTP/2 and cannot be probed with plain HTTP; the startup
# script keeps both processes alive and tears the container down if either
# exits, so the platform's orchestrator will restart it automatically.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["./start.sh"]
