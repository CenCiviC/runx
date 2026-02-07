# @cencivic/runx

[![npm version](https://img.shields.io/npm/v/@cencivic/runx.svg)](https://www.npmjs.com/package/@cencivic/runx)
[![npm downloads](https://img.shields.io/npm/dm/@cencivic/runx.svg)](https://www.npmjs.com/package/@cencivic/runx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Run TypeScript scripts with inline dependencies.

Inspired by [uv](https://github.com/astral-sh/uv)'s script runner for Python.

## Table of Contents

- [Why runx?](#why-runx)
- [Installation](#installation)
- [Usage](#usage)
- [CLI](#cli)
- [Contributing](#contributing)
- [Acknowledgments](#acknowledgments)
- [License](#license)

## Why runx?

### AI-friendly scripting without side effects

AI coding assistants (Claude, Copilot, Cursor, etc.) are great at generating one-off utility scripts — data migration, file processing, API testing, quick prototyping, and more. But these scripts often need external packages, and that's where things get messy:

- Adding dependencies to the project's `package.json` just for a throwaway script
- Lock file (`package-lock.json`, `bun.lock`) diffs polluting your git history
- Risk of version conflicts with your actual project dependencies
- Forgetting to clean up after the script is no longer needed

**runx solves this.** Each script declares its own dependencies inline, installed into an isolated cache — completely independent from your project.

```typescript
#!/usr/bin/env runx
/**
 * @runx {
 *   "dependencies": {
 *     "csv-parse": "^5.5.0",
 *     "chalk": "^5.3.0"
 *   }
 * }
 */

import { parse } from 'csv-parse/sync';
import chalk from 'chalk';

// AI-generated one-off migration script
// Zero impact on your project's package.json or lock file
const data = parse(await Bun.file('data.csv').text(), { columns: true });
console.log(chalk.green(`Processed ${data.length} rows`));
```

Just ask your AI assistant to *"write a runx script that does X"* — you get a single, self-contained `.ts` file that runs anywhere without touching your project configuration. When you're done, simply delete the file. No cleanup needed.

## Installation

```bash
npm install -g @cencivic/runx
```

Requires [bun](https://bun.sh) to be installed.

## Usage

Create a TypeScript file with dependencies declared in a `@runx` JSDoc block:

```typescript
#!/usr/bin/env runx
/**
 * @runx {
 *   "dependencies": {
 *     "zod": "^3.22.0",
 *     "chalk": "^5.3.0"
 *   }
 * }
 */

import { z } from 'zod';
import chalk from 'chalk';

const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const user = UserSchema.parse({ name: 'Alice', age: 30 });
console.log(chalk.green(`Hello, ${user.name}!`));
```

Run it:

```bash
runx script.ts
```

On first run, dependencies are installed and cached. Subsequent runs use the cache.

### Metadata Fields

The `@runx` block accepts a JSON object with the following fields:

| Field | Type | Description |
|---|---|---|
| `dependencies` | `Record<string, string>` | Package.json-style dependencies (required) |
| `env` | `Record<string, string>` | Environment variables to set |
| `engines` | `{ bun?: string; node?: string }` | Runtime version requirements |
| `args` | `string[]` | Default arguments for the script |

Full example with all fields:

```typescript
/**
 * @runx {
 *   "dependencies": {
 *     "chalk": "^5.0.0",
 *     "zod": "~3.22.0",
 *     "@types/node": "20.0.0"
 *   },
 *   "env": { "NODE_ENV": "production", "DEBUG": "true" },
 *   "engines": { "bun": ">=1.0", "node": ">=18" },
 *   "args": ["--verbose"]
 * }
 */
```

## CLI

```bash
runx <script.ts> [args...]   # Run a script
runx --clean                 # Clear all cached environments
runx --version               # Show version
runx --help                  # Show help
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Acknowledgments

- [uv](https://github.com/astral-sh/uv) - The inspiration for this project. uv's inline script dependencies for Python showed how powerful this pattern can be.
- [bun](https://bun.sh) - Used for fast dependency installation and script execution.

## License

MIT
