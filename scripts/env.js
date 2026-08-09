const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '..', '.env');
const targetPath = path.resolve(__dirname, '..', 'src', 'app', 'environments', 'environment.generated.ts');

let envFile = '';
if (fs.existsSync(envPath)) {
  envFile = fs.readFileSync(envPath, 'utf8');
}

const envVars = {};
for (const line of envFile.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const separatorIndex = trimmed.indexOf('=');
  if (separatorIndex === -1) continue;
  const key = trimmed.slice(0, separatorIndex).trim();
  const value = trimmed.slice(separatorIndex + 1).trim();
  envVars[key] = value.replace(/^['"]|['"]$/g, '');
}

const content = `export const environment = {
  production: true,
  apiBaseUrl: '${envVars.API_BASE_URL || 'https://publi-back.onrender.com'}',
  brandName: 'Flores Eternas',
  brandLogo: '🌸',
};
`;

fs.writeFileSync(targetPath, content);
