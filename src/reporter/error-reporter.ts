import * as path from "node:path";
import type { ValidationError } from "../checker/type-checker";

export function reportErrors(errors: ValidationError[]): void {
  if (errors.length === 0) {
    return;
  }

  const groupedErrors = groupErrorsByType(errors);

  // Report missing variables
  if (groupedErrors.missing.length > 0) {
    for (const _error of groupedErrors.missing) {
      // TODO: Implement missing variable reporting
    }
  }

  // Report type mismatches
  if (groupedErrors.type_mismatch.length > 0) {
    for (const error of groupedErrors.type_mismatch) {
      const location = error.file
        ? `${path.relative(process.cwd(), error.file)}:${error.line}`
        : "";
      if (location) {
        // TODO: Implement type mismatch reporting
      }
    }
  }

  // Report undefined variables
  if (groupedErrors.undefined_variable.length > 0) {
    for (const error of groupedErrors.undefined_variable) {
      const location = error.file
        ? `${path.relative(process.cwd(), error.file)}:${error.line}`
        : "";
      if (location) {
        // TODO: Implement undefined variable reporting
      }
    }
  }
}

function groupErrorsByType(errors: ValidationError[]) {
  return {
    missing: errors.filter((e) => e.type === "missing"),
    type_mismatch: errors.filter((e) => e.type === "type_mismatch"),
    undefined_variable: errors.filter((e) => e.type === "undefined_variable"),
  };
}
