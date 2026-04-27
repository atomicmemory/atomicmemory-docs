#!/usr/bin/env node
/**
 * @file Refresh the vendored atomicmemory-core OpenAPI spec.
 *
 * Pulls `openapi.yaml` from the installed `@atomicmemory/atomicmemory-core`
 * npm package (or a `file:` sibling) into `vendor/atomicmemory-core-openapi.yaml`
 * so Docusaurus can build without reaching across the workspace.
 *
 * Usage:
 *   1. `npm install @atomicmemory/atomicmemory-core@<version>`
 *      (or set a local file: dep pointing at a sibling checkout)
 *   2. `npm run vendor:spec`
 *   3. `npm run regen:api`
 *   4. Commit the result.
 *
 * The vendored spec is the source-of-truth for every `docusaurus
 * build`; running this script is how we pick up upstream core changes.
 */

import { createRequire } from 'node:module';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const vendorDir = resolve(repoRoot, 'vendor');
const destPath = resolve(vendorDir, 'atomicmemory-core-openapi.yaml');

// Resolve relative to cwd/package.json so the script finds the
// currently-installed core package, regardless of how this script was
// invoked.
const require = createRequire(pathToFileURL(resolve(process.cwd(), 'package.json')));

let sourcePath;
try {
  sourcePath = require.resolve('@atomicmemory/atomicmemory-core/openapi.yaml');
} catch (err) {
  console.error('Could not resolve @atomicmemory/atomicmemory-core/openapi.yaml.');
  console.error('Install the package first:');
  console.error('  npm install @atomicmemory/atomicmemory-core@<version>');
  console.error('Original error:', err?.message ?? err);
  process.exit(1);
}

if (!existsSync(vendorDir)) {
  mkdirSync(vendorDir, { recursive: true });
}

copyFileSync(sourcePath, destPath);
console.log(`Vendored ${sourcePath}`);
console.log(`→        ${destPath}`);
console.log('');
console.log("Next: run 'npm run regen:api' and commit the refreshed .mdx artifacts.");
