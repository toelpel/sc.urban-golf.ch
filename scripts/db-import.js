#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const CONTAINER_NAME = 'urbangolf-postgres-dev';
const DB_USER = 'postgres';
const DB_NAME = 'urban_golf';
const DUMP_FILE = join(rootDir, 'backend', 'db', 'init', 'schema.sql');

console.log('🔄 Importing database dump...\n');

// Check if dump file exists
if (!existsSync(DUMP_FILE)) {
  console.error('❌ Error: Dump file not found at:', DUMP_FILE);
  process.exit(1);
}

// Check if container is running
try {
  execSync(`docker ps --filter name=${CONTAINER_NAME} --format "{{.Names}}"`, {
    encoding: 'utf8',
    stdio: 'pipe'
  });
} catch (error) {
  console.error(`❌ Error: Container '${CONTAINER_NAME}' is not running!`);
  console.error('   Start it with: npm run docker:dev\n');
  process.exit(1);
}

const containerRunning = execSync(
  `docker ps --filter name=${CONTAINER_NAME} --format "{{.Names}}"`,
  { encoding: 'utf8' }
).trim();

if (!containerRunning) {
  console.error(`❌ Error: Container '${CONTAINER_NAME}' is not running!`);
  console.error('   Start it with: npm run docker:dev\n');
  process.exit(1);
}

console.log(`📦 Container: ${CONTAINER_NAME} ✓`);
console.log(`📄 Dump file: ${DUMP_FILE} ✓\n`);

// Import dump
try {
  console.log('📥 Importing dump into database...');

  const dumpContent = readFileSync(DUMP_FILE, 'utf8');

  execSync(
    `docker exec -i ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME}`,
    {
      input: dumpContent,
      stdio: ['pipe', 'inherit', 'inherit'],
      encoding: 'utf8'
    }
  );

  console.log('\n✅ Database import complete!');
  console.log(`   Verify with: docker exec -it ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -c "\\dt"\n`);

} catch (error) {
  console.error('\n❌ Error during import:', error.message);
  process.exit(1);
}
