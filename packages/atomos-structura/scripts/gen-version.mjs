import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

writeFileSync(
  join(__dirname, '../src/version.ts'),
  `// AUTO-GENERATED — do not edit manually. Run \`pnpm build\` to regenerate.\nexport const APP_VERSION = '${pkg.version}';\n`
);

console.log(`[gen-version] APP_VERSION = ${pkg.version}`);
