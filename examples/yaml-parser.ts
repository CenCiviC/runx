#!/usr/bin/env runx

/**
 * @runx {
 *   "dependencies": {
 *     "yaml": "2.6.1",
 *     "chalk": "^5.3.0"
 *   }
 * }
 */

import chalk from 'chalk';
import YAML from 'yaml';

const yamlContent = `
server:
  host: localhost
  port: 3000
  ssl: true

database:
  driver: postgres
  host: db.example.com
  port: 5432
  credentials:
    username: admin
    password: secret

features:
  - auth
  - logging
  - cache
`;

const config = YAML.parse(yamlContent);

console.log(chalk.bold('=== YAML Parser ===\n'));
console.log(chalk.blue('Parsed config:'));
console.log(
  chalk.green(`  Server: ${config.server.host}:${config.server.port} (SSL: ${config.server.ssl})`),
);
console.log(
  chalk.green(
    `  DB:     ${config.database.driver}://${config.database.host}:${config.database.port}`,
  ),
);
console.log(chalk.green(`  Features: ${config.features.join(', ')}`));

console.log(chalk.blue('\nBack to YAML:'));
console.log(chalk.gray(YAML.stringify({ server: config.server })));
