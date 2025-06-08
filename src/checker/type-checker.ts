import type { EnvVariable } from "../parsers/env-parser";
import type { Schema } from "../parsers/schema-parser";

export interface ValidationError {
  type: "missing" | "type_mismatch" | "undefined_variable";
  field?: string;
  expectedType?: string;
  actualValue?: string;
  file?: string;
  line?: number;
}

export function validateEnvVariables(
  envVariables: EnvVariable[],
  schema: Schema,
): ValidationError[] {
  const errors: ValidationError[] = [];
  const envMap = new Map<string, EnvVariable>();

  for (const env of envVariables) {
    envMap.set(env.key, env);
  }

  // Check for missing required variables
  for (const field of schema.fields) {
    if (!field.optional && !envMap.has(field.name)) {
      errors.push({
        type: "missing",
        field: field.name,
        expectedType: field.type,
      });
    }
  }

  // Check for type mismatches and undefined variables
  for (const env of envVariables) {
    const schemaField = schema.fields.find((f) => f.name === env.key);

    if (!schemaField) {
      errors.push({
        type: "undefined_variable",
        field: env.key,
        actualValue: env.value,
        file: env.file,
        line: env.line,
      });
    } else {
      const typeError = checkType(env.value, schemaField.type);
      if (typeError) {
        errors.push({
          type: "type_mismatch",
          field: env.key,
          expectedType: schemaField.type,
          actualValue: env.value,
          file: env.file,
          line: env.line,
        });
      }
    }
  }

  return errors;
}

function checkType(value: string, expectedType: string): boolean {
  if (expectedType === "string") {
    return false; // All env values are strings
  }

  if (expectedType === "number") {
    return Number.isNaN(Number(value));
  }

  if (expectedType === "boolean") {
    const lowerValue = value.toLowerCase();
    return !["true", "false", "1", "0", "yes", "no"].includes(lowerValue);
  }

  if (expectedType.includes("|")) {
    const types = expectedType.split("|").map((t) => t.trim());
    return types.every((type) => checkType(value, type));
  }

  return false;
}
