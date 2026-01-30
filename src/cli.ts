import { existsSync } from 'node:fs';
import { parseScriptMetadata } from './parser.js';
import { cleanCache, resolveEnvironment } from './resolver.js';
import { runScript } from './runner.js';

const VERSION = '0.1.0';

const HELP = `
runx - uv-like script runner for TypeScript

Usage:
  runx <script.ts> [args...]    Run a TypeScript script
  runx --clean                  Clean all cached environments
  runx --version                Show version
  runx --help                   Show this help

Example script:
  /**
   * /// script
   * dependencies = [
   *   "chalk@5.3.0",
   * ]
   * ///
   */
  import chalk from 'chalk';
  console.log(chalk.green('Hello!'));
`.trim();

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(HELP);
    process.exit(0);
  }

  if (args[0] === '--version' || args[0] === '-v') {
    console.log(VERSION);
    process.exit(0);
  }

  if (args[0] === '--clean') {
    await cleanCache();
    process.exit(0);
  }

  const scriptPath = args[0];
  const scriptArgs = args.slice(1);

  if (!existsSync(scriptPath)) {
    console.error(`Error: File not found: ${scriptPath}`);
    process.exit(1);
  }

  try {
    // Parse script metadata
    const metadata = await parseScriptMetadata(scriptPath);

    // Resolve environment (install deps if needed)
    const nodeModulesPath = await resolveEnvironment(metadata);

    // Run the script
    const exitCode = await runScript(scriptPath, nodeModulesPath, scriptArgs);
    process.exit(exitCode);
  } catch (err) {
    console.error('Error:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
