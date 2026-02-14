import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseMetadataFromContent } from '../src/parser.js';

const EXAMPLES_DIR = join(import.meta.dir, '..', 'examples');

function readExample(filename: string): string {
  return readFileSync(join(EXAMPLES_DIR, filename), 'utf-8');
}

describe('example files metadata parsing', () => {
  describe('TypeScript examples', () => {
    test('date-format.ts - dayjs with tilde range', () => {
      const content = readExample('date-format.ts');
      const result = parseMetadataFromContent(content);
      expect(result.dependencies).toEqual({
        dayjs: '~1.11.10',
        chalk: '^5.3.0',
      });
    });

    test('faker-demo.ts - scoped package with >= range + scripts', () => {
      const content = readExample('faker-demo.ts');
      const result = parseMetadataFromContent(content);
      expect(result.dependencies).toEqual({
        '@faker-js/faker': '>=9.0.0',
        chalk: '^5.3.0',
      });
      expect(result.scripts).toEqual({
        few: '--count 3',
        many: '--count 10',
      });
    });

    test('yaml-parser.ts - yaml with exact version', () => {
      const content = readExample('yaml-parser.ts');
      const result = parseMetadataFromContent(content);
      expect(result.dependencies).toEqual({
        yaml: '2.6.1',
        chalk: '^5.3.0',
      });
    });
  });

  describe('JavaScript examples', () => {
    test('slugify.js - wildcard version (*) + scripts', () => {
      const content = readExample('slugify.js');
      const result = parseMetadataFromContent(content);
      expect(result.dependencies).toEqual({
        slugify: '*',
        chalk: '^5.3.0',
      });
      expect(result.scripts).toEqual({
        strict: '--lower --strict',
      });
    });

    test('random-color.js - exact version + latest', () => {
      const content = readExample('random-color.js');
      const result = parseMetadataFromContent(content);
      expect(result.dependencies).toEqual({
        randomcolor: '0.6.2',
        chalk: 'latest',
      });
    });
  });

  describe('all examples have valid metadata', () => {
    const exampleFiles = readdirSync(EXAMPLES_DIR).filter(
      (f) => f.endsWith('.ts') || f.endsWith('.js'),
    );

    for (const file of exampleFiles) {
      test(`${file} has parseable @runx metadata`, () => {
        const content = readExample(file);
        const result = parseMetadataFromContent(content);
        expect(result).toBeDefined();
        expect(result.dependencies).toBeDefined();
        expect(typeof result.dependencies).toBe('object');
      });

      test(`${file} has at least one dependency`, () => {
        const content = readExample(file);
        const result = parseMetadataFromContent(content);
        expect(Object.keys(result.dependencies).length).toBeGreaterThan(0);
      });

      test(`${file} has shebang line`, () => {
        const content = readExample(file);
        expect(content.startsWith('#!/usr/bin/env runx')).toBe(true);
      });
    }
  });

  describe('version format coverage', () => {
    test('examples cover all version formats', () => {
      const allVersions: string[] = [];
      const exampleFiles = readdirSync(EXAMPLES_DIR).filter(
        (f) => f.endsWith('.ts') || f.endsWith('.js'),
      );

      for (const file of exampleFiles) {
        const content = readExample(file);
        const result = parseMetadataFromContent(content);
        allVersions.push(...Object.values(result.dependencies));
      }

      const versions = allVersions;

      // Check caret range (^)
      expect(versions.some((v) => v.startsWith('^'))).toBe(true);
      // Check tilde range (~)
      expect(versions.some((v) => v.startsWith('~'))).toBe(true);
      // Check exact version (digits only)
      expect(versions.some((v) => /^\d+\.\d+\.\d+$/.test(v))).toBe(true);
      // Check >= range
      expect(versions.some((v) => v.startsWith('>='))).toBe(true);
      // Check wildcard
      expect(versions.some((v) => v === '*')).toBe(true);
      // Check latest
      expect(versions.some((v) => v === 'latest')).toBe(true);
    });
  });
});
