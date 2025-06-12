import * as fs from "node:fs";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { parseEnvFile } from "../src/parsers/env-parser";

describe("env-parser", () => {
  const testEnvDir = "/tmp/tsenv-test-env";

  beforeEach(() => {
    if (!fs.existsSync(testEnvDir)) {
      fs.mkdirSync(testEnvDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testEnvDir)) {
      fs.rmSync(testEnvDir, { recursive: true, force: true });
    }
  });

  describe("parseEnvFile", () => {
    it("should parse basic env file", () => {
      const envPath = path.join(testEnvDir, ".env");
      const envContent = `
# This is a comment
API_KEY=secret123
PORT=3000
DEBUG=true
EMPTY_VALUE=
`;
      fs.writeFileSync(envPath, envContent);

      const variables = parseEnvFile(envPath);

      expect(variables).toHaveLength(4);
      expect(variables).toContainEqual({
        key: "API_KEY",
        value: "secret123",
        line: 3,
        file: path.resolve(envPath),
      });
      expect(variables).toContainEqual({
        key: "PORT",
        value: "3000",
        line: 4,
        file: path.resolve(envPath),
      });
      expect(variables).toContainEqual({
        key: "DEBUG",
        value: "true",
        line: 5,
        file: path.resolve(envPath),
      });
      expect(variables).toContainEqual({
        key: "EMPTY_VALUE",
        value: "",
        line: 6,
        file: path.resolve(envPath),
      });
    });

    it("should ignore comments and empty lines", () => {
      const envPath = path.join(testEnvDir, ".env");
      const envContent = `
# This is a comment
# Another comment

API_KEY=secret123

# More comments
PORT=3000
`;
      fs.writeFileSync(envPath, envContent);

      const variables = parseEnvFile(envPath);

      expect(variables).toHaveLength(2);
      expect(variables).toContainEqual({
        key: "API_KEY",
        value: "secret123",
        line: 5,
        file: path.resolve(envPath),
      });
      expect(variables).toContainEqual({
        key: "PORT",
        value: "3000",
        line: 8,
        file: path.resolve(envPath),
      });
    });

    it("should handle values with spaces and special characters", () => {
      const envPath = path.join(testEnvDir, ".env");
      const envContent = `
DATABASE_URL=postgres://user:password@localhost:5432/db
MESSAGE=Hello World with spaces
COMPLEX_VALUE=value with "quotes" and 'apostrophes'
JSON_CONFIG={"key":"value","number":123}
`;
      fs.writeFileSync(envPath, envContent);

      const variables = parseEnvFile(envPath);

      expect(variables).toHaveLength(4);
      expect(variables).toContainEqual({
        key: "DATABASE_URL",
        value: "postgres://user:password@localhost:5432/db",
        line: 2,
        file: path.resolve(envPath),
      });
      expect(variables).toContainEqual({
        key: "MESSAGE",
        value: "Hello World with spaces",
        line: 3,
        file: path.resolve(envPath),
      });
      expect(variables).toContainEqual({
        key: "COMPLEX_VALUE",
        value: "value with \"quotes\" and 'apostrophes'",
        line: 4,
        file: path.resolve(envPath),
      });
      expect(variables).toContainEqual({
        key: "JSON_CONFIG",
        value: '{"key":"value","number":123}',
        line: 5,
        file: path.resolve(envPath),
      });
    });

    it("should handle multiline values", () => {
      const envPath = path.join(testEnvDir, ".env");
      const envContent = `PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA0
-----END RSA PRIVATE KEY-----"
API_KEY=simple_value`;
      fs.writeFileSync(envPath, envContent);

      const variables = parseEnvFile(envPath);

      expect(variables).toHaveLength(2);
      expect(variables).toContainEqual({
        key: "PRIVATE_KEY",
        value:
          "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA0\n-----END RSA PRIVATE KEY-----",
        line: 1,
        file: path.resolve(envPath),
      });
      expect(variables).toContainEqual({
        key: "API_KEY",
        value: "simple_value",
        line: 4,
        file: path.resolve(envPath),
      });
    });

    it("should handle files with different line endings", () => {
      const envPath = path.join(testEnvDir, ".env");
      const envContent = "API_KEY=secret123\nPORT=3000\nDEBUG=true";
      fs.writeFileSync(envPath, envContent);

      const variables = parseEnvFile(envPath);

      expect(variables).toHaveLength(3);
      expect(variables).toContainEqual({
        key: "API_KEY",
        value: "secret123",
        line: 1,
        file: path.resolve(envPath),
      });
      expect(variables).toContainEqual({
        key: "PORT",
        value: "3000",
        line: 2,
        file: path.resolve(envPath),
      });
      expect(variables).toContainEqual({
        key: "DEBUG",
        value: "true",
        line: 3,
        file: path.resolve(envPath),
      });
    });
  });
});
