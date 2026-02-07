# @cencivic/runx

[![npm version](https://img.shields.io/npm/v/@cencivic/runx.svg)](https://www.npmjs.com/package/@cencivic/runx)
[![npm downloads](https://img.shields.io/npm/dm/@cencivic/runx.svg)](https://www.npmjs.com/package/@cencivic/runx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Run TypeScript scripts with inline dependencies.

Inspired by [uv](https://github.com/astral-sh/uv)'s script runner for Python.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [CLI](#cli)
- [Contributing](#contributing)
- [Acknowledgments](#acknowledgments)
- [License](#license)

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
