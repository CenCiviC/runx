import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import type { ScriptMetadata } from './types.js';

/**
 * Check if a version satisfies a semver constraint.
 * Supports: >=x.y, >x.y, =x.y, ^x.y, ~x.y, x.y
 */
function checkVersion(actual: string, constraint: string): boolean {
  // Parse actual version (e.g., "1.2.3" -> [1, 2, 3])
  const actualParts = actual.split('.').map(Number);

  // Parse constraint
  const match = constraint.match(/^(>=|>|=|\^|~)?(\d+)(?:\.(\d+))?(?:\.(\d+))?$/);
  if (!match) {
    return true; // Invalid constraint, skip check
  }

  const [, op = '>=', major, minor, patch] = match;
  const constraintParts = [
    Number(major),
    minor !== undefined ? Number(minor) : 0,
    patch !== undefined ? Number(patch) : 0,
  ];

  const compare = (): number => {
    for (let i = 0; i < 3; i++) {
      if ((actualParts[i] ?? 0) > constraintParts[i]) return 1;
      if ((actualParts[i] ?? 0) < constraintParts[i]) return -1;
    }
    return 0;
  };

  const cmp = compare();

  switch (op) {
    case '>=':
      return cmp >= 0;
    case '>':
      return cmp > 0;
    case '=':
      return cmp === 0;
    case '^':
      // ^x.y.z allows changes that do not modify the left-most non-zero digit
      if (actualParts[0] !== constraintParts[0]) return false;
      return cmp >= 0;
    case '~':
      // ~x.y.z allows patch-level changes
      if (actualParts[0] !== constraintParts[0]) return false;
      if (actualParts[1] !== constraintParts[1]) return false;
      return cmp >= 0;
    default:
      return cmp >= 0;
  }
}

/**
 * Validate engine requirements and warn if not satisfied.
 */
function validateEngines(engines: ScriptMetadata['engines']): void {
  if (!engines) return;

  if (engines.bun) {
    // Get bun version
    const bunVersion = process.versions.bun;
    if (bunVersion && !checkVersion(bunVersion, engines.bun)) {
      console.warn(`Warning: Script requires bun ${engines.bun}, but found ${bunVersion}`);
    }
  }

  if (engines.node) {
    const nodeVersion = process.versions.node;
    if (nodeVersion && !checkVersion(nodeVersion, engines.node)) {
      console.warn(`Warning: Script requires node ${engines.node}, but found ${nodeVersion}`);
    }
  }
}

/**
 * Run a TypeScript script with bun.
 */
export async function runScript(
  scriptPath: string,
  nodeModulesPath: string,
  args: string[],
  metadata?: ScriptMetadata,
): Promise<number> {
  const absoluteScriptPath = resolve(scriptPath);

  // Validate engine requirements
  if (metadata?.engines) {
    validateEngines(metadata.engines);
  }

  const env: NodeJS.ProcessEnv = { ...process.env };

  // Apply environment variables from metadata
  if (metadata?.env) {
    for (const [key, value] of Object.entries(metadata.env)) {
      env[key] = value;
    }
  }

  if (nodeModulesPath) {
    // Set NODE_PATH to include the cached node_modules
    const existingNodePath = env.NODE_PATH || '';
    env.NODE_PATH = existingNodePath ? `${nodeModulesPath}:${existingNodePath}` : nodeModulesPath;
  }

  // Combine metadata args with CLI args (CLI args take precedence)
  const metadataArgs = metadata?.args ?? [];
  const allArgs = [...metadataArgs, ...args];

  return new Promise((resolve, reject) => {
    const proc = spawn('bun', ['run', absoluteScriptPath, ...allArgs], {
      stdio: 'inherit',
      env,
    });

    proc.on('close', (code) => {
      resolve(code ?? 0);
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}
