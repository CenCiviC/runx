import { existsSync } from 'node:fs';

export function parseScriptArg(arg: string): { scriptPath: string; scriptName?: string } {
  // If the file exists as-is, don't parse colons (handles filenames with colons)
  if (existsSync(arg)) {
    return { scriptPath: arg };
  }

  // Split on last colon
  const lastColon = arg.lastIndexOf(':');
  if (lastColon === -1) {
    return { scriptPath: arg };
  }

  const scriptPath = arg.slice(0, lastColon);
  const scriptName = arg.slice(lastColon + 1);

  return { scriptPath, scriptName: scriptName || undefined };
}
