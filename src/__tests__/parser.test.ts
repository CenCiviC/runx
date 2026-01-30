import { describe, expect, test } from 'bun:test';
import { parseMetadataFromContent } from '../parser.js';

describe('parseMetadataFromContent', () => {
  test('parses single dependency', () => {
    const content = `
/**
 * /// script
 * dependencies = ["chalk@5.3.0"]
 * ///
 */
console.log('hello');
`;
    const result = parseMetadataFromContent(content);
    expect(result.dependencies).toEqual(['chalk@5.3.0']);
  });

  test('parses multiple dependencies', () => {
    const content = `
/**
 * /// script
 * dependencies = [
 *   "zod@3.22.0",
 *   "chalk@5.3.0",
 * ]
 * ///
 */
import { z } from 'zod';
`;
    const result = parseMetadataFromContent(content);
    expect(result.dependencies).toEqual(['zod@3.22.0', 'chalk@5.3.0']);
  });

  test('parses dependencies with single quotes', () => {
    const content = `
/**
 * /// script
 * dependencies = ['lodash@4.17.21']
 * ///
 */
`;
    const result = parseMetadataFromContent(content);
    expect(result.dependencies).toEqual(['lodash@4.17.21']);
  });

  test('returns empty array when no JSDoc block', () => {
    const content = `console.log('hello');`;
    const result = parseMetadataFromContent(content);
    expect(result.dependencies).toEqual([]);
  });

  test('returns empty array when no script block', () => {
    const content = `
/**
 * This is just a regular JSDoc comment
 */
console.log('hello');
`;
    const result = parseMetadataFromContent(content);
    expect(result.dependencies).toEqual([]);
  });

  test('returns empty array when no dependencies', () => {
    const content = `
/**
 * /// script
 * ///
 */
console.log('hello');
`;
    const result = parseMetadataFromContent(content);
    expect(result.dependencies).toEqual([]);
  });

  test('handles shebang with script block', () => {
    const content = `#!/usr/bin/env runx
/**
 * /// script
 * dependencies = ["chalk@5.3.0"]
 * ///
 */
console.log('hello');
`;
    const result = parseMetadataFromContent(content);
    expect(result.dependencies).toEqual(['chalk@5.3.0']);
  });

  test('parses dependencies without version', () => {
    const content = `
/**
 * /// script
 * dependencies = ["chalk"]
 * ///
 */
`;
    const result = parseMetadataFromContent(content);
    expect(result.dependencies).toEqual(['chalk']);
  });

  test('parses scoped packages', () => {
    const content = `
/**
 * /// script
 * dependencies = ["@types/node@20.0.0"]
 * ///
 */
`;
    const result = parseMetadataFromContent(content);
    expect(result.dependencies).toEqual(['@types/node@20.0.0']);
  });
});
