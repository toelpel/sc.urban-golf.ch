# Backend Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app

# Copy root package files and both workspace package.json files
# (npm needs the full workspace graph to resolve dependencies)
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install only backend production dependencies
RUN npm ci --workspace=backend --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy hoisted node_modules from workspace install
COPY --from=deps /app/node_modules ./node_modules

# Copy backend source code (flat layout: backend/ contents → /app/)
COPY backend/ .

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "app.js"]
