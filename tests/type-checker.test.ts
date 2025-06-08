import { describe, expect, it } from "vitest";
import { validateEnvVariables } from "../src/checker/type-checker";
import type { EnvVariable } from "../src/parsers/env-parser";
import type { Schema } from "../src/parsers/schema-parser";

describe("type-checker", () => {
  describe("validateEnvVariables", () => {
    it("should return error when string is assigned to boolean field", () => {
      const envVariables: EnvVariable[] = [
        { key: "DEBUG", value: "not_a_boolean", file: ".env", line: 1 },
      ];
      const schema: Schema = {
        fields: [{ name: "DEBUG", type: "boolean", optional: false }],
      };

      const errors = validateEnvVariables(envVariables, schema);

      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({
        type: "type_mismatch",
        field: "DEBUG",
        expectedType: "boolean",
        actualValue: "not_a_boolean",
        file: ".env",
        line: 1,
      });
    });

    it("should accept valid boolean values", () => {
      const booleanValues = [
        "true",
        "false",
        "TRUE",
        "FALSE",
        "1",
        "0",
        "yes",
        "no",
        "YES",
        "NO",
      ];

      for (const value of booleanValues) {
        const envVariables: EnvVariable[] = [
          { key: "DEBUG", value, file: ".env", line: 1 },
        ];
        const schema: Schema = {
          fields: [{ name: "DEBUG", type: "boolean", optional: false }],
        };

        const errors = validateEnvVariables(envVariables, schema);
        expect(errors).toHaveLength(0);
      }
    });

    it("should return error when non-number string is assigned to number field", () => {
      const envVariables: EnvVariable[] = [
        { key: "PORT", value: "not_a_number", file: ".env", line: 1 },
      ];
      const schema: Schema = {
        fields: [{ name: "PORT", type: "number", optional: false }],
      };

      const errors = validateEnvVariables(envVariables, schema);

      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({
        type: "type_mismatch",
        field: "PORT",
        expectedType: "number",
        actualValue: "not_a_number",
        file: ".env",
        line: 1,
      });
    });

    it("should accept valid number values", () => {
      const envVariables: EnvVariable[] = [
        { key: "PORT", value: "3000", file: ".env", line: 1 },
      ];
      const schema: Schema = {
        fields: [{ name: "PORT", type: "number", optional: false }],
      };

      const errors = validateEnvVariables(envVariables, schema);
      expect(errors).toHaveLength(0);
    });

    it("should always accept string types", () => {
      const envVariables: EnvVariable[] = [
        { key: "API_KEY", value: "some-api-key", file: ".env", line: 1 },
      ];
      const schema: Schema = {
        fields: [{ name: "API_KEY", type: "string", optional: false }],
      };

      const errors = validateEnvVariables(envVariables, schema);
      expect(errors).toHaveLength(0);
    });

    it("should return error for missing required variables", () => {
      const envVariables: EnvVariable[] = [];
      const schema: Schema = {
        fields: [{ name: "REQUIRED_VAR", type: "string", optional: false }],
      };

      const errors = validateEnvVariables(envVariables, schema);

      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({
        type: "missing",
        field: "REQUIRED_VAR",
        expectedType: "string",
      });
    });

    it("should not return error for missing optional variables", () => {
      const envVariables: EnvVariable[] = [];
      const schema: Schema = {
        fields: [{ name: "OPTIONAL_VAR", type: "string", optional: true }],
      };

      const errors = validateEnvVariables(envVariables, schema);
      expect(errors).toHaveLength(0);
    });

    it("should return error for undefined variables not in schema", () => {
      const envVariables: EnvVariable[] = [
        { key: "UNDEFINED_VAR", value: "some_value", file: ".env", line: 1 },
      ];
      const schema: Schema = {
        fields: [],
      };

      const errors = validateEnvVariables(envVariables, schema);

      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({
        type: "undefined_variable",
        field: "UNDEFINED_VAR",
        actualValue: "some_value",
        file: ".env",
        line: 1,
      });
    });

    it("should handle union types", () => {
      const envVariables: EnvVariable[] = [
        { key: "MODE", value: "invalid", file: ".env", line: 1 },
      ];
      const schema: Schema = {
        fields: [{ name: "MODE", type: "string | number", optional: false }],
      };

      const errors = validateEnvVariables(envVariables, schema);
      expect(errors).toHaveLength(0);
    });
  });
});
