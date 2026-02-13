import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

const REGISTRY_URL = 'https://registry.npmjs.org/@cencivic/runx/latest';
const CHECK_INTERVAL = 86_400_000; // 24 hours

interface UpdateCheckResult {
  latest: string;
  time: number;
}

/**
 * Get path for the update check cache file.
 */
function getCacheFile(): string {
  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA;
    if (localAppData) {
      return join(localAppData, 'runx', 'update-check.json');
    }
    return join(homedir(), 'AppData', 'Local', 'runx', 'update-check.json');
  }
  const xdgCacheHome = process.env.XDG_CACHE_HOME;
  if (xdgCacheHome) {
    return join(xdgCacheHome, 'runx', 'update-check.json');
  }
  return join(homedir(), '.cache', 'runx', 'update-check.json');
}

/**
 * Read cached update check result.
 */
async function readCache(): Promise<UpdateCheckResult | null> {
  try {
    const cacheFile = getCacheFile();
    if (!existsSync(cacheFile)) return null;
    const data = await readFile(cacheFile, 'utf-8');
    return JSON.parse(data) as UpdateCheckResult;
  } catch {
    return null;
  }
}

/**
 * Write update check result to cache.
 */
async function writeCache(result: UpdateCheckResult): Promise<void> {
  const cacheFile = getCacheFile();
  await mkdir(dirname(cacheFile), { recursive: true });
  await writeFile(cacheFile, JSON.stringify(result));
}

/**
 * Compare two semver version strings.
 * Returns true if `latest` is newer than `current`.
 */
function isNewer(current: string, latest: string): boolean {
  const a = current.split('.').map(Number);
  const b = latest.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((b[i] ?? 0) > (a[i] ?? 0)) return true;
    if ((b[i] ?? 0) < (a[i] ?? 0)) return false;
  }
  return false;
}

/**
 * Check npm registry for a newer version of runx.
 * Caches result for 24 hours. Returns silently on any error.
 */
export async function checkForUpdate(currentVersion: string): Promise<string> {
  // Skip in CI
  if (process.env.CI) return '';

  try {
    const cached = await readCache();
    const now = Date.now();

    // Use cache if within 24h
    if (cached && now - cached.time < CHECK_INTERVAL) {
      return isNewer(currentVersion, cached.latest) ? cached.latest : '';
    }

    // Fetch with 1.5s timeout
    const response = await Promise.race([
      fetch(REGISTRY_URL),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500)),
    ]);

    const data = (await response.json()) as { version: string };
    const latest = data.version;

    await writeCache({ latest, time: now });

    return isNewer(currentVersion, latest) ? latest : '';
  } catch {
    return '';
  }
}

/**
 * Format update notification message.
 */
export function formatUpdateMessage(currentVersion: string, latestVersion: string): string {
  return [
    '',
    `  Update available: ${currentVersion} → \x1b[32m${latestVersion}\x1b[0m`,
    `  Run \x1b[36mnpm install -D @cencivic/runx@latest\x1b[0m to update`,
    '',
  ].join('\n');
}
