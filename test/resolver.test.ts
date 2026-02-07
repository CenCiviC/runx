import { describe, expect, test } from 'bun:test';
import { generateCacheKey, getCacheDir } from '../src/resolver.js';

describe('generateCacheKey', () => {
  test('generates consistent hash for same dependencies', () => {
    const metadata = { dependencies: { chalk: '5.3.0', zod: '3.22.0' } };
    const key1 = generateCacheKey(metadata);
    const key2 = generateCacheKey(metadata);
    expect(key1).toBe(key2);
  });

  test('generates same hash regardless of dependency order', () => {
    const metadata1 = { dependencies: { chalk: '5.3.0', zod: '3.22.0' } };
    const metadata2 = { dependencies: { zod: '3.22.0', chalk: '5.3.0' } };
    expect(generateCacheKey(metadata1)).toBe(generateCacheKey(metadata2));
  });

  test('generates different hash for different dependencies', () => {
    const metadata1 = { dependencies: { chalk: '5.3.0' } };
    const metadata2 = { dependencies: { zod: '3.22.0' } };
    expect(generateCacheKey(metadata1)).not.toBe(generateCacheKey(metadata2));
  });

  test('generates different hash for different versions', () => {
    const metadata1 = { dependencies: { chalk: '5.3.0' } };
    const metadata2 = { dependencies: { chalk: '5.2.0' } };
    expect(generateCacheKey(metadata1)).not.toBe(generateCacheKey(metadata2));
  });

  test('generates consistent hash for empty dependencies', () => {
    const metadata = { dependencies: {} };
    const key = generateCacheKey(metadata);
    expect(key).toBe(generateCacheKey({ dependencies: {} }));
  });

  test('returns 16 character hash', () => {
    const metadata = { dependencies: { chalk: '5.3.0' } };
    const key = generateCacheKey(metadata);
    expect(key.length).toBe(16);
  });
});

describe('getCacheDir', () => {
  test('includes script name in cache directory', () => {
    const metadata = { dependencies: { chalk: '5.3.0' } };
    const dir = getCacheDir(metadata, '/path/to/hello.ts');
    const key = generateCacheKey(metadata);
    expect(dir).toContain(`hello-${key}`);
  });

  test('strips extension from script name', () => {
    const metadata = { dependencies: { chalk: '5.3.0' } };
    const dir = getCacheDir(metadata, '/path/to/script.ts');
    expect(dir).not.toContain('.ts');
    expect(dir).toContain('script-');
  });

  test('handles script with multiple dots in name', () => {
    const metadata = { dependencies: { chalk: '5.3.0' } };
    const dir = getCacheDir(metadata, '/path/to/my.script.test.ts');
    expect(dir).toContain('my.script.test-');
  });
});
