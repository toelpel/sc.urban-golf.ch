# Frontend Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app

# Copy root package files and both workspace package.json files
# (npm needs the full workspace graph to resolve dependencies)
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install frontend dependencies (including devDependencies for build)
RUN npm ci --workspace=frontend

FROM node:20-alpine AS builder
WORKDIR /app

# Build arguments for environment variables
ARG VITE_API_BASEURL
ENV VITE_API_BASEURL=$VITE_API_BASEURL

# Copy node_modules from workspace install
COPY --from=deps /app/node_modules ./node_modules

# Copy frontend source code (flat layout: frontend/ contents → /app/)
COPY frontend/ .

# Build frontend
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

RUN addgroup -g 1001 -S nginx-app && \
    adduser -S nginx-app -u 1001 && \
    chown -R nginx-app:nginx-app /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && chown -R nginx-app:nginx-app /var/run/nginx.pid

USER nginx-app
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO /dev/null http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
