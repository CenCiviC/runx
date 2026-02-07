import { describe, expect, test } from 'bun:test';
import { parseMetadataFromContent } from '../src/parser.js';

describe('parseMetadataFromContent', () => {
  describe('dependencies parsing', () => {
    test('parses single dependency', () => {
      const content = `
/**
 * @runx { "dependencies": { "chalk": "5.3.0" } }
 */
console.log('hello');
`;
      const result = parseMetadataFromContent(content);
      expect(result.dependencies).toEqual({ chalk: '5.3.0' });
    });

    test('parses multiple dependencies', () => {
      const content = `
/**
 * @runx {
 *   "dependencies": { "zod": "3.22.0", "chalk": "5.3.0" }
 * }
 */
import { z } from 'zod';
`;
      const result = parseMetadataFromContent(content);
      expect(result.dependencies).toEqual({ zod: '3.22.0', chalk: '5.3.0' });
    });

    test('parses dependencies with latest version', () => {
      const content = `
/**
 * @runx { "dependencies": { "chalk": "latest" } }
 */
`;
      const result = parseMetadataFromContent(content);
      expect(result.dependencies).toEqual({ chalk: 'latest' });
    });

    test('parses scoped packages', () => {
      const content = `
/**
 * @runx { "dependencies": { "@types/node": "20.0.0" } }
 */
`;
      const result = parseMetadataFromContent(content);
      expect(result.dependencies).toEqual({ '@types/node': '20.0.0' });
    });

    test('parses caret version range (^)', () => {
      const content = `
/**
 * @runx { "dependencies": { "chalk": "^5.0.0" } }
 */
`;
      const result = parseMetadataFromContent(content);
      expect(result.dependencies).toEqual({ chalk: '^5.0.0' });
    });

    test('parses tilde version range (~)', () => {
      const content = `
/**
 * @runx { "dependencies": { "zod": "~3.22.0" } }
 */
`;
      const result = parseMetadataFromContent(content);
      expect(result.dependencies).toEqual({ zod: '~3.22.0' });
    });

    test('parses comparison version ranges (>=, >, <, <=)', () => {
      const content = `
/**
 * @runx { "dependencies": { "express": ">=4.0.0", "lodash": "<5.0.0" } }
 */
`;
      const result = parseMetadataFromContent(content);
      expect(result.dependencies).toEqual({ express: '>=4.0.0', lodash: '<5.0.0' });
    });

    test('parses wildcard version (*)', () => {
      const content = `
/**
 * @runx { "dependencies": { "axios": "*" } }
 */
`;
      const result = parseMetadataFromContent(content);
      expect(result.dependencies).toEqual({ axios: '*' });
    });

    test('parses mixed version formats', () => {
      const content = `
/**
 * @runx {
 *   "dependencies": {
 *     "chalk": "^5.0.0",
 *     "zod": "~3.22.0",
 *     "lodash": "4.17.21",
 *     "axios": "latest",
 *     "express": ">=4.0.0"
 *   }
 * }
 */
`;
      const result = parseMetadataFromContent(content);
      expect(result.dependencies).toEqual({
        chalk: '^5.0.0',
        zod: '~3.22.0',
        lodash: '4.17.21',
        axios: 'latest',
        express: '>=4.0.0',
      });
    });
  });

  describe('multiline JSON', () => {
    test('parses multiline dependencies', () => {
      const content = `
/**
 * @runx {
 *   "dependencies": {
 *     "chalk": "5.3.0",
 *     "zod": "3.22.0"
 *   }
 * }
 */
import chalk from 'chalk';
`;
      const result = parseMetadataFromContent(content);
      expect(result.dependencies).toEqual({ chalk: '5.3.0', zod: '3.22.0' });
    });
  });

  describe('edge cases', () => {
    test('returns empty object when no JSDoc block', () => {
      const content = `console.log('hello');`;
      const result = parseMetadataFromContent(content);
      expect(result.dependencies).toEqual({});
    });

    test('returns empty object when no @runx tag', () => {
      const content = `
/**
 * This is just a regular JSDoc comment
 */
console.log('hello');
`;
      const result = parseMetadataFromContent(content);
      expect(result.dependencies).toEqual({});
    });

    test('returns empty object when @runx tag has no JSON', () => {
      const content = `
/**
 * @runx
 */
console.log('hello');
`;
      const result = parseMetadataFromContent(content);
      expect(result.dependencies).toEqual({});
    });

    test('handles shebang with @runx tag', () => {
      const content = `#!/usr/bin/env runx
/**
 * @runx { "dependencies": { "chalk": "5.3.0" } }
 */
console.log('hello');
`;
      const result = parseMetadataFromContent(content);
      expect(result.dependencies).toEqual({ chalk: '5.3.0' });
    });

    test('throws error for invalid JSON', () => {
      const content = `
/**
 * @runx { dependencies: { "chalk": "5.0.0" } }
 */
`;
      expect(() => parseMetadataFromContent(content)).toThrow('Invalid JSON');
    });

    test('handles empty dependencies object', () => {
      const content = `
/**
 * @runx { "dependencies": {} }
 */
`;
      const result = parseMetadataFromContent(content);
      expect(result.dependencies).toEqual({});
    });

    test('ignores other JSDoc tags', () => {
      const content = `
/**
 * @param {string} name - The name
 * @runx { "dependencies": { "chalk": "5.3.0" } }
 * @returns {void}
 */
`;
      const result = parseMetadataFromContent(content);
      expect(result.dependencies).toEqual({ chalk: '5.3.0' });
    });
  });
});
