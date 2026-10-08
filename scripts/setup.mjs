/**
 * RailOne Next reproducible teammate setup.
 * Runs only when explicitly invoked; never starts CI or deploys anything.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const node = process.versions.node.split('.').map(Number);
if (node[0] < 22 || (node[0] === 22 && node[1] < 13)) {
  console.error('RailOne requires Node.js 22.13.0+ for the built-in SQLite backend.');
  process.exit(1);
}

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
function install(cwd, label) {
  console.log('Installing ' + label + ' from lockfile...');
  const result = spawnSync(npm, ['ci', '--no-audit'], {
    cwd, stdio: 'inherit', shell: process.platform === 'win32'
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    console.error('Install failed for ' + label + '. Check npm/network/lockfile and retry.');
    process.exit(result.status || 1);
  }
}
install(projectRoot, 'web / API');
if (!process.argv.includes('--web-only')) {
  install(path.join(projectRoot, 'apps', 'mobile'), 'native mobile');
}
const example = path.join(projectRoot, '.env.example');
const localEnv = path.join(projectRoot, '.env');
if (!existsSync(localEnv) && existsSync(example)) {
  copyFileSync(example, localEnv);
  console.log('Created local .env from safe example; never commit secrets.');
}
console.log('\nSetup finished. Web: npm run dev. Mobile: npm run mobile:dev.');
console.log('Requires internet for npm packages. Native builds additionally need Android/iOS SDKs.');
