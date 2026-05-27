# ══════════════════════════════════════════════════════
# HitPoints — Production Dockerfile
# Multi-stage build: Node (build) → Nginx (serve)
# ══════════════════════════════════════════════════════

# ── Stage 1: Build ──────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# ── Stage 2: Production ────────────────────────────
FROM nginxinc/nginx-unprivileged:1.27-alpine AS production

USER root
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ || exit 1

LABEL org.opencontainers.image.title="HitPoints" \
      org.opencontainers.image.description="Lightweight browser-based API & WebSocket testing tool" \
      org.opencontainers.image.source="https://github.com/hitpoints/hitpoints" \
      org.opencontainers.image.vendor="HitPoints"

USER 101

CMD ["nginx", "-g", "daemon off;"]