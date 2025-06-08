import chalk from 'chalk';
import * as path from 'path';
import { ValidationError } from '../checker/type-checker';

export function reportErrors(errors: ValidationError[]): void {
  if (errors.length === 0) {
    console.log(chalk.green('✓ All environment variables are valid'));
    return;
  }

  console.log(chalk.red(`✗ Found ${errors.length} validation error${errors.length > 1 ? 's' : ''}:\n`));

  const groupedErrors = groupErrorsByType(errors);

  // Report missing variables
  if (groupedErrors.missing.length > 0) {
    console.log(chalk.yellow('Missing required variables:'));
    groupedErrors.missing.forEach(error => {
      console.log(`  ${chalk.red('•')} ${chalk.bold(error.field)} (expected: ${chalk.cyan(error.expectedType)})`);
    });
    console.log();
  }

  // Report type mismatches
  if (groupedErrors.type_mismatch.length > 0) {
    console.log(chalk.yellow('Type mismatches:'));
    groupedErrors.type_mismatch.forEach(error => {
      const location = error.file ? `${path.relative(process.cwd(), error.file)}:${error.line}` : '';
      console.log(`  ${chalk.red('•')} ${chalk.bold(error.field)}`);
      console.log(`    Expected: ${chalk.cyan(error.expectedType)}`);
      console.log(`    Actual: ${chalk.red(`"${error.actualValue}"`)}`);
      if (location) {
        console.log(`    Location: ${chalk.gray(location)}`);
      }
    });
    console.log();
  }

  // Report undefined variables
  if (groupedErrors.undefined_variable.length > 0) {
    console.log(chalk.yellow('Undefined variables in schema:'));
    groupedErrors.undefined_variable.forEach(error => {
      const location = error.file ? `${path.relative(process.cwd(), error.file)}:${error.line}` : '';
      console.log(`  ${chalk.red('•')} ${chalk.bold(error.field)} = "${error.actualValue}"`);
      if (location) {
        console.log(`    Location: ${chalk.gray(location)}`);
      }
    });
  }
}

function groupErrorsByType(errors: ValidationError[]) {
  return {
    missing: errors.filter(e => e.type === 'missing'),
    type_mismatch: errors.filter(e => e.type === 'type_mismatch'),
    undefined_variable: errors.filter(e => e.type === 'undefined_variable')
  };
}