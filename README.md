# tsenv

Type-check environment variables against TypeScript schemas.

[日本語版 README はこちら (Japanese README)](./README.ja.md)

## Installation

```bash
npm install -D @kobapi28/tsenv
# or
pnpm add -D @kobapi28/tsenv
# or
yarn add -D @kobapi28/tsenv
```

## Usage

### 1. Define your environment variable types

Create a TypeScript file that exports your environment variable schema:

```typescript
// env.ts
type Env = {
    API_URL: string
    ASSET_URL: string
    PORT?: number
    DEBUG?: boolean
}

export default Env
```

### 2. Create a configuration file

Create `tsenv.config.js` in your project root:

```javascript
// tsenv.config.js
module.exports = {
    schema: './env.ts',      // Path to your type definition
    files: ['./env/**']      // Glob patterns for env files to check
}
```

Or if you're using TypeScript with tsx/ts-node:

```typescript
// tsenv.config.ts
export default {
    schema: './env.ts',
    files: ['./env/**']
}
```

### 3. Run the type checker

```bash
npx tsenv check
```

You can also specify a custom config file:

```bash
npx tsenv check -c ./custom-config.ts
```

## Features

- ✅ Type checking for `string`, `number`, and `boolean` types
- ✅ Optional properties support (using `?`)
- ✅ Multiple env files support with glob patterns
- ✅ Clear error reporting with file locations
- ✅ Missing required variables detection
- ✅ Undefined variables detection
- ✅ Multiline environment variable support
- ✅ Error handling when no files match specified patterns

## Example

See the [example](./example) directory for a complete working example.

## Error Types

### Missing Required Variables
Variables defined as required in the schema but not found in any env file.

### Type Mismatches
Variables with values that don't match their expected types.

### Undefined Variables
Variables found in env files but not defined in the schema.

## License

MIT