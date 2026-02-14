import { readFile } from 'node:fs/promises';
import { type Block, parse } from 'comment-parser';
import type { ScriptMetadata } from './types.js';

/**
 * Parse script metadata from @runx JSDoc tag.
 *
 * Expected format:
 * /**
 *  * @runx {
 *  *   "dependencies": {
 *  *     "zod": "^3.22.0",
 *  *     "chalk": "^5.3.0"
 *  *   }
 *  * }
 *  *\/
 */
export async function parseScriptMetadata(scriptPath: string): Promise<ScriptMetadata> {
  const content = await readFile(scriptPath, 'utf-8');
  return parseMetadataFromContent(content);
}

export function parseMetadataFromContent(content: string): ScriptMetadata {
  const parsed = parse(content);

  for (const block of parsed) {
    for (const tag of block.tags) {
      if (tag.tag === 'runx') {
        const jsonStr = extractJsonFromTag(tag);
        if (jsonStr) {
          try {
            const metadata = JSON.parse(jsonStr);
            return {
              dependencies: metadata.dependencies ?? {},
              scripts: metadata.scripts ?? {},
            };
          } catch {
            throw new Error(`Invalid JSON in @runx tag: ${jsonStr}`);
          }
        }
      }
    }
  }

  return { dependencies: {}, scripts: {} };
}

function extractJsonFromTag(tag: Block['tags'][0]): string | null {
  // comment-parser puts { ... } content in the 'type' token
  // For multiline JSON, we need to reconstruct from all source lines
  const typeParts: string[] = [];
  for (const sourceLine of tag.source) {
    const typeToken = sourceLine.tokens.type;
    if (typeToken) {
      typeParts.push(typeToken);
    }
  }

  const fullContent = typeParts.join('\n').trim();

  // Find the JSON object boundaries
  const startIndex = fullContent.indexOf('{');
  if (startIndex === -1) {
    return null;
  }

  // Find matching closing brace
  let braceCount = 0;
  let endIndex = -1;

  for (let i = startIndex; i < fullContent.length; i++) {
    if (fullContent[i] === '{') {
      braceCount++;
    } else if (fullContent[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        endIndex = i;
        break;
      }
    }
  }

  if (endIndex === -1) {
    return null;
  }

  return fullContent.slice(startIndex, endIndex + 1);
}
