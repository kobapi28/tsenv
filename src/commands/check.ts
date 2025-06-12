import { glob } from "glob";
import { validateEnvVariables } from "../checker/type-checker";
import { loadConfig } from "../config/loader";
import { type EnvVariable, parseEnvFile } from "../parsers/env-parser";
import { parseSchemaFile } from "../parsers/schema-parser";
import { reportErrors } from "../reporter/error-reporter";

interface CheckOptions {
  config: string;
}

export async function checkCommand(options: CheckOptions) {
  try {
    const config = await loadConfig(options.config);
    const schema = parseSchemaFile(config.schema);

    // Find all env files
    const envFiles: string[] = [];
    for (const pattern of config.files) {
      const files = await glob(pattern, { absolute: false });
      envFiles.push(...files);
    }

    if (envFiles.length === 0) {
      throw new Error(
        `No files match the specified patterns: ${config.files.join(", ")}`,
      );
    }

    // Parse all env files
    const allVariables: EnvVariable[] = [];
    const processedFiles: string[] = [];
    for (const file of envFiles) {
      try {
        const variables = parseEnvFile(file);
        allVariables.push(...variables);
        processedFiles.push(file);
      } catch (_error) {}
    }

    // Validate
    const errors = validateEnvVariables(allVariables, schema);

    // Report errors
    reportErrors(errors, processedFiles);

    // Exit with error code if there are errors
    if (errors.length > 0) {
      process.exit(1);
    }
  } catch (_error) {
    process.exit(1);
  }
}
