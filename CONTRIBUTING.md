# Contributing to runx

Thank you for your interest in contributing to runx!  
This document provides guidelines and instructions for contributing.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18
- **[bun](https://bun.sh)** - Required for running tests and scripts

## Getting Started

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/runx.git
   cd runx
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Build the project**

   ```bash
   bun run build
   ```

4. **Run tests to verify setup**

   ```bash
   bun test
   ```

## Project Structure

```
runx/
├── bin/          # CLI entry point
├── dist/         # Compiled output
├── src/          # Source code
│   ├── cli.ts    # CLI implementation
│   ├── parser.ts # Script metadata parser
│   └── ...
├── biome.json    # Linter/formatter config
├── package.json
└── tsconfig.json
```

## Development Workflow

### Running Tests

```bash
bun test
```

### Linting

We use [Biome](https://biomejs.dev/) for linting and formatting.

```bash
# Check and auto-fix issues
bun run lint

# Check without fixing
bun run check
```

### Formatting

```bash
bun run format
```

### Building

```bash
bun run build
```

## Code Style

This project uses Biome for code style enforcement. The configuration is in `biome.json`. Key points:

- Use tabs for indentation
- Use double quotes for strings
- No semicolons required (handled by Biome)

Run `bun run lint` before committing to ensure your code follows the style guide.

## Submitting Changes

### Branch Naming

Use descriptive branch names:

- `feature/add-xyz` - For new features
- `fix/issue-description` - For bug fixes
- `docs/update-readme` - For documentation changes

### Commit Convention

Write clear, concise commit messages:

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Fix bug" not "Fixes bug")
- Keep the first line under 72 characters
- Reference issues when applicable (e.g., "Fix #123")

### Pull Request Process

1. Create a new branch from `main`
2. Make your changes
3. Run tests and linting: `bun test && bun run lint`
4. Push your branch and open a Pull Request
5. Fill out the PR template
6. Wait for review

## Reporting Issues

When reporting bugs, please include:

- runx version (`runx --version`)
- Node.js version (`node --version`)
- bun version (`bun --version`)
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Minimal script example if applicable

## Questions?

Feel free to open an issue for any questions or discussions about contributing.
