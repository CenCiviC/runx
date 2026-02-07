import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';
import type { ScriptMetadata } from './types.js';

/**
 * Get platform-appropriate cache base directory.
 */
function getCacheBase(): string {
  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA;
    if (localAppData) {
      return join(localAppData, 'runx', 'envs');
    }
    return join(homedir(), 'AppData', 'Local', 'runx', 'envs');
  }
  // macOS & Linux: XDG_CACHE_HOME or ~/.cache
  const xdgCacheHome = process.env.XDG_CACHE_HOME;
  if (xdgCacheHome) {
    return join(xdgCacheHome, 'runx', 'envs');
  }
  return join(homedir(), '.cache', 'runx', 'envs');
}

/**
 * Generate cache key from dependencies.
 */
export function generateCacheKey(metadata: ScriptMetadata): string {
  const sortedEntries = Object.entries(metadata.dependencies).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const content = JSON.stringify(sortedEntries);
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}

/**
 * Extract script name (without extension) from script path.
 */
function getScriptName(scriptPath: string): string {
  const base = basename(scriptPath);
  const dotIndex = base.lastIndexOf('.');
  return dotIndex > 0 ? base.slice(0, dotIndex) : base;
}

/**
 * Get cache directory path for given metadata and script path.
 */
export function getCacheDir(metadata: ScriptMetadata, scriptPath: string): string {
  const key = generateCacheKey(metadata);
  const scriptName = getScriptName(scriptPath);
  return join(getCacheBase(), `${scriptName}-${key}`);
}

/**
 * Check if cache exists for given metadata.
 */
export function cacheExists(metadata: ScriptMetadata, scriptPath: string): boolean {
  const cacheDir = getCacheDir(metadata, scriptPath);
  return existsSync(join(cacheDir, 'node_modules'));
}

/**
 * Create package.json content for dependencies.
 */
function createPackageJson(metadata: ScriptMetadata): string {
  return JSON.stringify(
    {
      name: 'runx-env',
      version: '0.0.0',
      private: true,
      dependencies: metadata.dependencies,
    },
    null,
    2,
  );
}

/**
 * Run bun install in the cache directory.
 */
async function runBunInstall(cacheDir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('bun', ['install'], {
      cwd: cacheDir,
      stdio: 'inherit',
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`bun install failed with code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

/**
 * Resolve environment for script metadata.
 * Creates cache if it doesn't exist.
 */
export async function resolveEnvironment(
  metadata: ScriptMetadata,
  scriptPath: string,
): Promise<string> {
  if (Object.keys(metadata.dependencies).length === 0) {
    return '';
  }

  const cacheDir = getCacheDir(metadata, scriptPath);

  if (cacheExists(metadata, scriptPath)) {
    return join(cacheDir, 'node_modules');
  }

  // Create cache directory
  await mkdir(cacheDir, { recursive: true });

  // Write package.json
  const packageJson = createPackageJson(metadata);
  await writeFile(join(cacheDir, 'package.json'), packageJson);

  // Run bun install
  console.error(`Installing dependencies...`);
  await runBunInstall(cacheDir);

  return join(cacheDir, 'node_modules');
}

/**
 * Clean all cached environments.
 */
export async function cleanCache(): Promise<void> {
  const cacheBase = getCacheBase();
  if (!existsSync(cacheBase)) {
    console.log('Cache is already empty.');
    return;
  }

  const entries = await readdir(cacheBase);
  await rm(cacheBase, { recursive: true, force: true });
  console.log(`Cleaned ${entries.length} cached environment(s).`);
}
