import { readFile } from 'node:fs/promises';
import type { ScriptMetadata } from './types.js';

/**
 * Parse script metadata from JSDoc block.
 *
 * Expected format:
 * /**
 *  * /// script
 *  * dependencies = [
 *  *   "zod@3.22.0",
 *  *   "chalk@5.3.0",
 *  * ]
 *  * ///
 *  *\/
 */
export async function parseScriptMetadata(scriptPath: string): Promise<ScriptMetadata> {
  const content = await readFile(scriptPath, 'utf-8');
  return parseMetadataFromContent(content);
}

export function parseMetadataFromContent(content: string): ScriptMetadata {
  // Match JSDoc block containing /// script ... ///
  const jsdocPattern = /\/\*\*[\s\S]*?\*\//;
  const jsdocMatch = content.match(jsdocPattern);

  if (!jsdocMatch) {
    return { dependencies: [] };
  }

  const jsdocBlock = jsdocMatch[0];

  // Check if this JSDoc block contains /// script ... ///
  const scriptBlockPattern = /\/\/\/\s*script\s*([\s\S]*?)\/\/\//;
  const scriptMatch = jsdocBlock.match(scriptBlockPattern);

  if (!scriptMatch) {
    return { dependencies: [] };
  }

  const scriptContent = scriptMatch[1];

  // Parse dependencies array
  const dependencies = parseDependencies(scriptContent);

  return { dependencies };
}

function parseDependencies(content: string): string[] {
  // Remove JSDoc asterisks from lines
  const cleanedContent = content
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, ''))
    .join('\n');

  // Match dependencies = [...] pattern
  const depsPattern = /dependencies\s*=\s*\[([\s\S]*?)\]/;
  const depsMatch = cleanedContent.match(depsPattern);

  if (!depsMatch) {
    return [];
  }

  const depsContent = depsMatch[1];

  // Extract quoted strings
  const stringPattern = /"([^"]+)"|'([^']+)'/g;
  const dependencies: string[] = [];

  for (const match of depsContent.matchAll(stringPattern)) {
    dependencies.push(match[1] || match[2]);
  }

  return dependencies;
}
