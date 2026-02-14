#!/usr/bin/env runx

/**
 * @runx {
 *   "dependencies": {
 *     "slugify": "*",
 *     "chalk": "^5.3.0"
 *   },
 *   "scripts": {
 *     "strict": "--lower --strict"
 *   }
 * }
 */

import chalk from 'chalk';
import slugify from 'slugify';

const args = process.argv.slice(2);
const lower = args.includes('--lower');
const strict = args.includes('--strict');

const titles = [
  'Hello World! This is RunX',
  'TypeScript & JavaScript Examples',
  'café résumé naïve',
  '한국어 테스트 문자열',
  '2024 Best Practices for Node.js',
];

const mode = strict ? 'strict' : lower ? 'lower' : 'default';
console.log(chalk.bold(`=== URL Slug Generator (${mode}) ===\n`));

for (const title of titles) {
  const slug = slugify(title, { lower, strict });
  console.log(chalk.green(`"${title}"`));
  console.log(chalk.gray(`  → ${slug}\n`));
}
