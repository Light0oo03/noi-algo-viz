const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const envPath = path.join(__dirname, '../.env');

dotenv.config({ path: envPath });

function resolveProviderFromUrl(url) {
  if (!url || typeof url !== 'string') return 'sqlite';
  const normalized = url.trim().toLowerCase();
  if (normalized.startsWith('postgresql://') || normalized.startsWith('postgres://')) {
    return 'postgresql';
  }
  return 'sqlite';
}

try {
  let content = fs.readFileSync(schemaPath, 'utf8');
  const provider = resolveProviderFromUrl(process.env.DATABASE_URL);
  const next = content.replace(/provider\s*=\s*"(sqlite|postgresql)"/, `provider = "${provider}"`);

  if (next === content) {
    console.log(`Schema provider already matches DATABASE_URL (${provider}).`);
    process.exit(0);
  }

  fs.writeFileSync(schemaPath, next);
  console.log(`Schema provider updated to ${provider}.`);
} catch (e) {
  console.error('Failed to update schema:', e);
  process.exit(1);
}
