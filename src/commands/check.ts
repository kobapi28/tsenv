import { glob } from 'glob';
import * as path from 'path';
import chalk from 'chalk';
import { loadConfig } from '../config/loader';
import { parseEnvFile, EnvVariable } from '../parsers/env-parser';
import { parseSchemaFile } from '../parsers/schema-parser';
import { validateEnvVariables } from '../checker/type-checker';
import { reportErrors } from '../reporter/error-reporter';

interface CheckOptions {
  config: string;
}

export async function checkCommand(options: CheckOptions) {
  try {
    // Load config
    console.log(chalk.gray('Loading config...'));
    const config = await loadConfig(options.config);
    
    // Parse schema
    console.log(chalk.gray('Parsing schema...'));
    const schema = parseSchemaFile(config.schema);
    console.log(chalk.gray(`Found ${schema.fields.length} field${schema.fields.length !== 1 ? 's' : ''} in schema\n`));
    
    // Find all env files
    const envFiles: string[] = [];
    for (const pattern of config.files) {
      const files = await glob(pattern, { absolute: false });
      envFiles.push(...files);
    }
    
    if (envFiles.length === 0) {
      console.log(chalk.yellow('No environment files found matching the patterns'));
      return;
    }
    
    console.log(chalk.gray(`Checking ${envFiles.length} file${envFiles.length !== 1 ? 's' : ''}...\n`));
    
    // Parse all env files
    const allVariables: EnvVariable[] = [];
    for (const file of envFiles) {
      try {
        const variables = parseEnvFile(file);
        allVariables.push(...variables);
      } catch (error) {
        console.error(chalk.red(`Error parsing ${file}: ${error instanceof Error ? error.message : error}`));
      }
    }
    
    // Validate
    const errors = validateEnvVariables(allVariables, schema);
    
    // Report errors
    reportErrors(errors);
    
    // Exit with error code if there are errors
    if (errors.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}