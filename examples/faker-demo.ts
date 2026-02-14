#!/usr/bin/env runx
/**
 * @runx {
 *   "dependencies": {
 *     "@faker-js/faker": ">=9.0.0",
 *     "chalk": "^5.3.0"
 *   },
 *   "scripts": {
 *     "few": "--count 3",
 *     "many": "--count 10"
 *   }
 * }
 */

import { faker } from '@faker-js/faker';
import chalk from 'chalk';

const args = process.argv.slice(2);
const countIdx = args.indexOf('--count');
const count = countIdx !== -1 ? parseInt(args[countIdx + 1], 10) || 5 : 5;

console.log(chalk.bold.blue(`=== Fake User Profiles (${count}) ===\n`));

for (let i = 0; i < count; i++) {
  const name = faker.person.fullName();
  const email = faker.internet.email();
  const job = faker.person.jobTitle();
  const city = faker.location.city();

  console.log(chalk.green(`${i + 1}. ${name}`));
  console.log(chalk.gray(`   Email: ${email}`));
  console.log(chalk.gray(`   Job:   ${job}`));
  console.log(chalk.gray(`   City:  ${city}\n`));
}
