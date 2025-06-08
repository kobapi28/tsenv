import * as fs from "node:fs";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { parseSchemaFile } from "../src/parsers/schema-parser";

describe("schema-parser", () => {
  const testSchemaDir = "/tmp/tsenv-test-schemas";

  beforeEach(() => {
    if (!fs.existsSync(testSchemaDir)) {
      fs.mkdirSync(testSchemaDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testSchemaDir)) {
      fs.rmSync(testSchemaDir, { recursive: true, force: true });
    }
  });

  describe("parseSchemaFile", () => {
    it("should parse basic TypeScript environment schema", () => {
      const schemaPath = path.join(testSchemaDir, "env.d.ts");
      const schemaContent = `
type Env = {
  API_KEY: string;
  PORT: number;
  DEBUG: boolean;
  OPTIONAL_VAR?: string;
};
`;
      fs.writeFileSync(schemaPath, schemaContent);

      const schema = parseSchemaFile(schemaPath);

      expect(schema.fields).toHaveLength(4);
      expect(schema.fields).toContainEqual({
        name: "API_KEY",
        type: "string",
        optional: false,
      });
      expect(schema.fields).toContainEqual({
        name: "PORT",
        type: "number",
        optional: false,
      });
      expect(schema.fields).toContainEqual({
        name: "DEBUG",
        type: "boolean",
        optional: false,
      });
      expect(schema.fields).toContainEqual({
        name: "OPTIONAL_VAR",
        type: "string",
        optional: true,
      });
    });

    it("should parse union types", () => {
      const schemaPath = path.join(testSchemaDir, "env.d.ts");
      const schemaContent = `
type Env = {
  NODE_ENV: string | number;
  LOG_LEVEL: string | boolean;
  COMPLEX_UNION: string | number | boolean;
};
`;
      fs.writeFileSync(schemaPath, schemaContent);

      const schema = parseSchemaFile(schemaPath);

      expect(schema.fields).toHaveLength(3);
      expect(schema.fields).toContainEqual({
        name: "NODE_ENV",
        type: "string | number",
        optional: false,
      });
      expect(schema.fields).toContainEqual({
        name: "LOG_LEVEL",
        type: "string | boolean",
        optional: false,
      });
      expect(schema.fields).toContainEqual({
        name: "COMPLEX_UNION",
        type: "string | number | boolean",
        optional: false,
      });
    });

    it("should handle mix of required and optional fields", () => {
      const schemaPath = path.join(testSchemaDir, "env.d.ts");
      const schemaContent = `
type Env = {
  REQUIRED_STRING: string;
  REQUIRED_NUMBER: number;
  REQUIRED_BOOLEAN: boolean;
  OPTIONAL_STRING?: string;
  OPTIONAL_NUMBER?: number;
  OPTIONAL_BOOLEAN?: boolean;
  OPTIONAL_UNION?: string | number;
};
`;
      fs.writeFileSync(schemaPath, schemaContent);

      const schema = parseSchemaFile(schemaPath);

      expect(schema.fields).toHaveLength(7);

      const requiredFields = schema.fields.filter((f) => !f.optional);
      const optionalFields = schema.fields.filter((f) => f.optional);

      expect(requiredFields).toHaveLength(3);
      expect(optionalFields).toHaveLength(4);

      expect(requiredFields.map((f) => f.name)).toEqual([
        "REQUIRED_STRING",
        "REQUIRED_NUMBER",
        "REQUIRED_BOOLEAN",
      ]);
      expect(optionalFields.map((f) => f.name)).toEqual([
        "OPTIONAL_STRING",
        "OPTIONAL_NUMBER",
        "OPTIONAL_BOOLEAN",
        "OPTIONAL_UNION",
      ]);
    });

    // TODO: Literal types should be inferred as their literal values rather than widened to string type
    it("should handle literal string types as string", () => {
      const schemaPath = path.join(testSchemaDir, "env.d.ts");
      const schemaContent = `
type Env = {
  ENVIRONMENT: "development" | "production" | "test";
  MODE: "strict";
};
`;
      fs.writeFileSync(schemaPath, schemaContent);

      const schema = parseSchemaFile(schemaPath);

      expect(schema.fields).toHaveLength(2);
      expect(schema.fields).toContainEqual({
        name: "ENVIRONMENT",
        type: "string | string | string",
        optional: false,
      });
      expect(schema.fields).toContainEqual({
        name: "MODE",
        type: "string",
        optional: false,
      });
    });

    // TODO: if can't find Env type, should throw an error
    it("should return empty schema for files without Env type", () => {
      const schemaPath = path.join(testSchemaDir, "empty.d.ts");
      const schemaContent = `
type OtherType = {
  some: string;
};

interface SomeInterface {
  prop: number;
}
`;
      fs.writeFileSync(schemaPath, schemaContent);

      const schema = parseSchemaFile(schemaPath);

      expect(schema.fields).toHaveLength(0);
    });

    it("should handle complex nested structure (but only parse top-level Env)", () => {
      const schemaPath = path.join(testSchemaDir, "complex.d.ts");
      const schemaContent = `
type DatabaseConfig = {
  host: string;
  port: number;
};

type Env = {
  API_KEY: string;
  DATABASE_URL: string;
  FEATURE_FLAGS?: string;
};

type AppConfig = {
  env: Env;
  db: DatabaseConfig;
};
`;
      fs.writeFileSync(schemaPath, schemaContent);

      const schema = parseSchemaFile(schemaPath);

      expect(schema.fields).toHaveLength(3);
      expect(schema.fields.map((f) => f.name)).toEqual([
        "API_KEY",
        "DATABASE_URL",
        "FEATURE_FLAGS",
      ]);
    });
  });
});
