#!/usr/bin/env runx

/**
 * @runx {
 *   "dependencies": {
 *     "dayjs": "~1.11.10",
 *     "chalk": "^5.3.0"
 *   }
 * }
 */

import chalk from 'chalk';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const now = dayjs();

console.log(chalk.bold('=== Date Formatting with dayjs ==='));
console.log(chalk.green(`Now:        ${now.format('YYYY-MM-DD HH:mm:ss')}`));
console.log(chalk.yellow(`ISO:        ${now.toISOString()}`));
console.log(chalk.cyan(`Relative:   ${dayjs('2024-01-01').fromNow()}`));
console.log(chalk.magenta(`Unix:       ${now.unix()}`));
