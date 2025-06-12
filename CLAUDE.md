This file describes the coding conventions and settings for this project, referred to as "Rules" or "Rule File".

## Most Important Rule - Process for Adding New Rules
If you receive an instruction from the user that is deemed to require consistent application rather than a one-time response:

1. Ask, "Should this be made a standard rule?"
2. If a YES response is received, add it as an additional rule to CLAUDE.md.
3. Thereafter, always apply it as a standard rule.

Through this process, we will continuously improve the project's rules.

# Package Manager
This project uses **pnpm** as the package manager. Always use pnpm commands:
- `pnpm install` - Install dependencies
- `pnpm test` - Run tests
- `pnpm build` - Build the project
- `pnpm biome:lint` - Run linting
- `pnpm biome:format` - Format code
- `pnpm type:check` - Type checking
- `pnpm check` - Run type check and biome check
