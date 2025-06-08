import * as path from "node:path";
import chalk from "chalk";
import type { ValidationError } from "../checker/type-checker";

export function reportErrors(errors: ValidationError[]): void {
  if (errors.length === 0) {
    // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
    console.log(chalk.green("✓ All environment variables are valid"));
    return;
  }

  const groupedErrors = groupErrorsByType(errors);

  // Report missing variables
  if (groupedErrors.missing.length > 0) {
    // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
    console.log(chalk.red("✗ Missing required variables:"));
    for (const error of groupedErrors.missing) {
      // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
      console.log(
        `  ${chalk.yellow(error.field ?? "unknown")} (expected: ${error.expectedType})`,
      );
    }
    // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
    console.log();
  }

  // Report type mismatches
  if (groupedErrors.type_mismatch.length > 0) {
    // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
    console.log(chalk.red("✗ Type mismatches:"));
    for (const error of groupedErrors.type_mismatch) {
      const location = error.file
        ? `${path.relative(process.cwd(), error.file)}:${error.line}`
        : "";
      // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
      console.log(`  ${chalk.yellow(error.field ?? "unknown")} at ${location}`);
      // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
      console.log(
        `    Expected: ${error.expectedType}, Got: "${error.actualValue}"`,
      );
    }
    // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
    console.log();
  }

  // Report undefined variables
  if (groupedErrors.undefined_variable.length > 0) {
    // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
    console.log(chalk.red("✗ Undefined variables (not in schema):"));
    for (const error of groupedErrors.undefined_variable) {
      const location = error.file
        ? `${path.relative(process.cwd(), error.file)}:${error.line}`
        : "";
      // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
      console.log(`  ${chalk.yellow(error.field ?? "unknown")} at ${location}`);
      // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
      console.log(`    Value: "${error.actualValue}"`);
    }
    // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
    console.log();
  }
}

function groupErrorsByType(errors: ValidationError[]) {
  return {
    missing: errors.filter((e) => e.type === "missing"),
    type_mismatch: errors.filter((e) => e.type === "type_mismatch"),
    undefined_variable: errors.filter((e) => e.type === "undefined_variable"),
  };
}
