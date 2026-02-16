#!/bin/bash
set -e

echo "🔄 Importing database dump..."

# Check if container is running
if ! docker ps | grep -q urbangolf-postgres-dev; then
    echo "❌ Error: Postgres container is not running!"
    echo "   Start it with: docker-compose -f docker-compose.dev.yml up -d"
    exit 1
fi

# Import dump
echo "📥 Loading dump.sql into database..."
docker exec -i urbangolf-postgres-dev psql -U postgres -d urban_golf < backend/db/init/dump.sql

echo "✅ Database import complete!"
echo "   You can verify with: docker exec -it urbangolf-postgres-dev psql -U postgres -d urban_golf -c '\dt'"
