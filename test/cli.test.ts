import { describe, expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { parseScriptArg } from '../src/script-arg.js';

describe('parseScriptArg', () => {
  test('returns scriptPath and scriptName from colon syntax', () => {
    const result = parseScriptArg('script.js:dev');
    expect(result).toEqual({ scriptPath: 'script.js', scriptName: 'dev' });
  });

  test('returns only scriptPath when no colon', () => {
    const result = parseScriptArg('script.js');
    expect(result).toEqual({ scriptPath: 'script.js' });
  });

  test('splits on last colon for paths with multiple colons', () => {
    const result = parseScriptArg('some:file.ts:prod');
    expect(result).toEqual({ scriptPath: 'some:file.ts', scriptName: 'prod' });
  });

  test('returns scriptPath without scriptName when colon is at end', () => {
    const result = parseScriptArg('script.js:');
    expect(result).toEqual({ scriptPath: 'script.js' });
  });

  test('does not parse colon if file exists as-is', () => {
    // package.json exists in the repo root
    const testPath = 'package.json';
    expect(existsSync(testPath)).toBe(true);
    const result = parseScriptArg(testPath);
    expect(result).toEqual({ scriptPath: testPath });
  });

  test('handles .ts extension with script name', () => {
    const result = parseScriptArg('server.ts:dev');
    expect(result).toEqual({ scriptPath: 'server.ts', scriptName: 'dev' });
  });
});
