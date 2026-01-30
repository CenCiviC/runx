# @cencivic/runx

Run TypeScript scripts with inline dependencies.

Inspired by [uv](https://github.com/astral-sh/uv)'s script runner for Python.

## Installation

```bash
npm install -g @cencivic/runx
```

Requires [bun](https://bun.sh) to be installed.

## Usage

Create a TypeScript file with dependencies declared in a JSDoc block:

```typescript
#!/usr/bin/env runx
/**
 * /// script
 * dependencies = [
 *   "zod@3.22.0",
 *   "chalk@5.3.0",
 * ]
 * ///
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

## How it works

1. Parse JSDoc metadata from the script
2. Generate cache key from sorted dependencies (`sha256`)
3. Check `~/.cache/runx/envs/<hash>/`
   - If exists → use cached environment
   - If not → create `package.json` and run `bun install`
4. Run script with `NODE_PATH` set to cached `node_modules`

## CLI

```bash
runx <script.ts> [args...]   # Run a script
runx --clean                 # Clear all cached environments
runx --version               # Show version
runx --help                  # Show help
```

## License

MIT
