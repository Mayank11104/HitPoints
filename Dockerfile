# ══════════════════════════════════════════════════════
# HitPoints — Production Dockerfile
# Multi-stage build: Node (build) → Nginx (serve)
# ══════════════════════════════════════════════════════

# ── Stage 1: Build ──────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests first (layer caching)
COPY package.json package-lock.json* ./

# Install dependencies (ci = clean install, deterministic)
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# ── Stage 2: Production ────────────────────────────
FROM nginx:1.27-alpine AS production

# Remove default nginx static assets & config
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Security: run as non-root user
RUN addgroup -g 1001 -S hitpoints && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G hitpoints hitpoints && \
    chown -R hitpoints:hitpoints /var/cache/nginx /var/log/nginx /etc/nginx/conf.d && \
    chmod -R 755 /usr/share/nginx/html && \
    # Nginx needs to write to these dirs
    chown -R hitpoints:hitpoints /var/run

# Switch to non-root
USER hitpoints

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/ || exit 1

# Labels (OCI standard)
LABEL org.opencontainers.image.title="HitPoints" \
      org.opencontainers.image.description="Lightweight browser-based API & WebSocket testing tool" \
      org.opencontainers.image.source="https://github.com/hitpoints/hitpoints" \
      org.opencontainers.image.vendor="HitPoints"

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
