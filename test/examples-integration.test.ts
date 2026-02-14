import { describe, expect, test } from 'bun:test';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

const EXAMPLES_DIR = join(import.meta.dir, '..', 'examples');
const BIN_PATH = join(import.meta.dir, '..', 'bin', 'runx.js');

/**
 * Run an example script via runx and capture output + exit code.
 */
function runExample(
  filename: string,
  args: string[] = [],
  timeoutMs = 30_000,
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const scriptPath = join(EXAMPLES_DIR, filename);
    const proc = spawn('node', [BIN_PATH, scriptPath, ...args], {
      timeout: timeoutMs,
      env: { ...process.env, NO_COLOR: '1' },
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      resolve({ code: code ?? 1, stdout, stderr });
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

describe('example integration tests', () => {
  describe('TypeScript examples', () => {
    test(
      'date-format.ts runs successfully',
      async () => {
        const { code, stdout } = await runExample('date-format.ts');
        expect(code).toBe(0);
        expect(stdout).toContain('Date Formatting with dayjs');
        expect(stdout).toContain('Now:');
        expect(stdout).toContain('ISO:');
        expect(stdout).toContain('Relative:');
        expect(stdout).toContain('Unix:');
      },
      { timeout: 30_000 },
    );

    test(
      'faker-demo.ts runs successfully with default count',
      async () => {
        const { code, stdout } = await runExample('faker-demo.ts');
        expect(code).toBe(0);
        expect(stdout).toContain('Fake User Profiles (5)');
        expect(stdout).toContain('Email:');
        expect(stdout).toContain('Job:');
        expect(stdout).toContain('City:');
      },
      { timeout: 30_000 },
    );

    test(
      'faker-demo.ts accepts --count argument',
      async () => {
        const { code, stdout } = await runExample('faker-demo.ts', ['--count', '2']);
        expect(code).toBe(0);
        expect(stdout).toContain('Fake User Profiles (2)');
        expect(stdout).toContain('2.');
        expect(stdout).not.toContain('3.');
      },
      { timeout: 30_000 },
    );

    test(
      'yaml-parser.ts runs successfully',
      async () => {
        const { code, stdout } = await runExample('yaml-parser.ts');
        expect(code).toBe(0);
        expect(stdout).toContain('YAML Parser');
        expect(stdout).toContain('localhost:3000');
        expect(stdout).toContain('postgres');
        expect(stdout).toContain('auth, logging, cache');
      },
      { timeout: 30_000 },
    );
  });

  describe('JavaScript examples', () => {
    test(
      'slugify.js runs successfully in default mode',
      async () => {
        const { code, stdout } = await runExample('slugify.js');
        expect(code).toBe(0);
        expect(stdout).toContain('URL Slug Generator (default)');
      },
      { timeout: 30_000 },
    );

    test(
      'slugify.js accepts --lower --strict arguments',
      async () => {
        const { code, stdout } = await runExample('slugify.js', ['--lower', '--strict']);
        expect(code).toBe(0);
        expect(stdout).toContain('URL Slug Generator (strict)');
        expect(stdout).toContain('hello-world');
      },
      { timeout: 30_000 },
    );

    test(
      'random-color.js runs successfully',
      async () => {
        const { code, stdout } = await runExample('random-color.js');
        expect(code).toBe(0);
        expect(stdout).toContain('Random Color Palette Generator');
        expect(stdout).toContain('Vibrant');
        expect(stdout).toContain('Pastel');
        expect(stdout).toContain('Dark');
        // Should contain hex color codes
        expect(stdout).toMatch(/#[0-9a-fA-F]{6}/);
      },
      { timeout: 30_000 },
    );
  });
});
