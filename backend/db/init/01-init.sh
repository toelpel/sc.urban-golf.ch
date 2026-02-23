#!/bin/bash
set -e

echo "Initializing Urban Golf database..."

# Check if dump file exists
if [ -f /docker-entrypoint-initdb.d/schema.sql ]; then
  echo "Loading schema..."
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" < /docker-entrypoint-initdb.d/schema.sql
  echo "Schema loaded successfully!"
else
  echo "No schema.sql found, skipping..."
fi

echo "Database initialization complete!"
