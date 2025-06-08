# tsenv Example

This directory contains a sample configuration for tsenv.

## Files

- `env.ts` - TypeScript schema defining environment variable types
- `.env` - Example environment file with valid variables
- `test.env` - Example environment file with some type errors
- `tsenv.config.ts` - Configuration file for tsenv

## Running the example

From this directory:

```bash
# Install tsenv (if not already installed)
cd ..
pnpm install
pnpm build

# Run the type checker
cd example
../node_modules/.bin/tsx ../src/cli.ts check
```

This will check both `.env` and `test.env` files against the schema defined in `env.ts`.