import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

/**
 * Run a TypeScript script with bun.
 */
export async function runScript(
  scriptPath: string,
  nodeModulesPath: string,
  args: string[],
): Promise<number> {
  const absoluteScriptPath = resolve(scriptPath);

  const env: NodeJS.ProcessEnv = { ...process.env };

  if (nodeModulesPath) {
    // Set NODE_PATH to include the cached node_modules
    const existingNodePath = env.NODE_PATH || '';
    env.NODE_PATH = existingNodePath ? `${nodeModulesPath}:${existingNodePath}` : nodeModulesPath;
  }

  return new Promise((resolve, reject) => {
    const proc = spawn('bun', ['run', absoluteScriptPath, ...args], {
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
