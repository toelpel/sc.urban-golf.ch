# Urban Golf - Deployment Guide

## Architecture Overview

This application uses a containerized architecture with:
- **Frontend**: Nginx serving static Vue.js SPA
- **Backend**: Node.js/Fastify API server
- **Database**: PostgreSQL 16

## Local Development

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development without Docker)

### Quick Start

1. **Copy environment variables**
   ```bash
   cp .env.example .env
   ```

2. **Start all services**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000
   - pgAdmin: http://localhost:5050

### Database Initialization

The database is automatically initialized with the dump file on first start:
- Location: `backend/db/init/dump.sql`
- The init script runs only when the database is empty

### Development Workflow

**Start services:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

**View logs:**
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

**Rebuild after code changes:**
```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

**Stop services:**
```bash
docker-compose -f docker-compose.dev.yml down
```

**Reset database (CAUTION: deletes all data):**
```bash
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

## Production Deployment

### Simple Deployment (Standalone)

The simplest way to deploy:

1. **Configure environment**
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your values
   ```

2. **Start the stack**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://your-server-ip:8080
   - Backend API: http://your-server-ip:3000

### Deployment with Pre-built Images

For using images from a registry (optional):

   ```bash
   # Backend
   docker build -t ghcr.io/yourusername/urbangolf-backend:latest ./backend
   docker push ghcr.io/yourusername/urbangolf-backend:latest

   # Frontend
   docker build \
     --build-arg VITE_API_BASEURL=/api \
     -t ghcr.io/yourusername/urbangolf-frontend:latest ./frontend
   docker push ghcr.io/yourusername/urbangolf-frontend:latest
   ```

2. **Copy and customize the production example**
   ```bash
   cp docker-compose.prod.example.yml docker-compose.override.yml
   ```

3. **Edit docker-compose.override.yml**
   - Uncomment the `image:` lines
   - Update registry/username
   - Comment out the `build:` sections

4. **Configure environment**
   ```bash
   cp .env.production.example .env
   nano .env
   ```

5. **Start the stack**
   ```bash
   docker-compose up -d
   ```

### Using with Reverse Proxy

If you want to use a reverse proxy (Traefik, Nginx Proxy Manager, Caddy):

1. **Deploy the stack** (as described above)

2. **Configure your reverse proxy** to forward traffic:
   - Frontend: `yourdomain.com` → `http://server-ip:8080`
   - API: `yourdomain.com/api` → `http://server-ip:3000`

3. **Update ALLOWED_ORIGINS**
   ```bash
   # In .env
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

4. **Restart backend**
   ```bash
   docker-compose restart backend
   ```

### Updating Production

**Simple deployment:**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**With registry (advanced):**
```bash
# Build and push new images (see above)
docker-compose pull
docker-compose up -d
```

## Database Management

### Create a new dump

From a running container:
```bash
docker exec urbangolf-postgres-dev pg_dump -U postgres -d urban_golf \
  --no-owner --no-acl --clean --if-exists > backend/db/init/dump.sql
```

### Restore from dump manually

```bash
docker exec -i urbangolf-postgres-dev psql -U postgres -d urban_golf < backend/db/init/dump.sql
```

### Access database via CLI

```bash
docker exec -it urbangolf-postgres-dev psql -U postgres -d urban_golf
```

## Environment Variables Reference

### Root .env
- `POSTGRES_DB` - Database name (default: urban_golf)
- `POSTGRES_USER` - Database user (default: postgres)
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_PORT` - Exposed database port (dev only, default: 5432)
- `PGADMIN_PORT` - pgAdmin port (dev only, default: 5050)
- `BACKEND_PORT` - Backend port (dev only, default: 3000)
- `FRONTEND_PORT` - Frontend port (dev only, default: 8080)
- `ALLOWED_ORIGINS` - CORS allowed origins
- `DATABASE_SSL` - Enable SSL for database (default: false)

## Troubleshooting

### Database connection errors
- Ensure PostgreSQL is running: `docker-compose ps`
- Check logs: `docker-compose logs postgres`
- Verify `DATABASE_URL` in backend environment

### Frontend can't connect to API
- Check `ALLOWED_ORIGINS` includes frontend URL
- Verify backend is running: `docker-compose ps backend`
- Check backend logs: `docker-compose logs backend`

### Permission errors in containers
- Ensure volumes have correct permissions
- Check that non-root users can access mounted volumes

## Security Notes

- Never commit `.env` files with real credentials
- Use strong passwords in production
- Keep Docker images updated
- Review and update `ALLOWED_ORIGINS` for production
- Enable `DATABASE_SSL=true` when using external database services
