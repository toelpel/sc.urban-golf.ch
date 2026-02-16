#!/bin/bash
set -e

echo "Initializing Urban Golf database..."

# Check if dump file exists
if [ -f /docker-entrypoint-initdb.d/dump.sql ]; then
  echo "Loading database dump..."
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" < /docker-entrypoint-initdb.d/dump.sql
  echo "Database dump loaded successfully!"
else
  echo "No dump.sql found, skipping..."
fi

echo "Database initialization complete!"
