const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const candidates = [
  process.env.PRIMEDOOR_ENV_FILE,
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '.env'),
  path.resolve(__dirname, '..', '.env'),
  '/var/www/primedoor-api/.env',
  '/var/www/primedoor-api/backend/.env',
].filter(Boolean);

const loaded = [];
const seen = new Set();

for (const file of candidates) {
  if (seen.has(file)) continue;
  seen.add(file);

  if (fs.existsSync(file)) {
    dotenv.config({ path: file, override: false });
    loaded.push(file);
  }
}

if (!loaded.length) {
  console.warn('⚠️ No .env file found; using PM2/system environment only');
}

module.exports = { loadedEnvFiles: loaded };