import * as fs from "node:fs";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadConfig } from "../src/config/loader";

describe("config-loader", () => {
  const testConfigDir = "/tmp/tsenv-test-configs";

  beforeEach(() => {
    if (!fs.existsSync(testConfigDir)) {
      fs.mkdirSync(testConfigDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testConfigDir)) {
      fs.rmSync(testConfigDir, { recursive: true, force: true });
    }
  });

  describe("loadConfig", () => {
    it("should load config with file pattern using regex", async () => {
      const configPath = path.join(testConfigDir, "tsenv.config.js");
      const configContent = `
module.exports = {
  schema: "./env.d.ts",
  files: ["./src/**/*.env", ".env*", "test/**/*.env"]
};
`;
      fs.writeFileSync(configPath, configContent);

      const config = await loadConfig(configPath);

      expect(config).toEqual({
        schema: "./env.d.ts",
        files: ["./src/**/*.env", ".env*", "test/**/*.env"],
      });
    });

    it("should load TypeScript config with glob patterns", async () => {
      const configPath = path.join(testConfigDir, "tsenv.config.ts");
      const configContent = `
export default {
  schema: "./types/env.d.ts",
  files: ["**/*.env", "!node_modules/**", "config/*.env"]
};
`;
      fs.writeFileSync(configPath, configContent);

      const config = await loadConfig(configPath);

      expect(config).toEqual({
        schema: "./types/env.d.ts",
        files: ["**/*.env", "!node_modules/**", "config/*.env"],
      });
    });

    it("should throw error when config file does not exist", async () => {
      const nonExistentPath = path.join(
        testConfigDir,
        "non-existent.config.js",
      );

      await expect(loadConfig(nonExistentPath)).rejects.toThrow(
        `Config file not found: ${path.resolve(nonExistentPath)}`,
      );
    });

    it("should throw error when config lacks schema property", async () => {
      const configPath = path.join(testConfigDir, "invalid.config.js");
      const configContent = `
module.exports = {
  files: [".env"]
};
`;
      fs.writeFileSync(configPath, configContent);

      await expect(loadConfig(configPath)).rejects.toThrow(
        'Config must have a "schema" property with a string value',
      );
    });

    it("should throw error when config lacks files property", async () => {
      const configPath = path.join(testConfigDir, "invalid2.config.js");
      const configContent = `
module.exports = {
  schema: "./env.d.ts"
};
`;
      fs.writeFileSync(configPath, configContent);

      // TODO: should throw error with more specific message
      await expect(loadConfig(configPath)).rejects.toThrow("files");
    });

    it("should throw error when files is not an array", async () => {
      const configPath = path.join(testConfigDir, "invalid3.config.js");
      const configContent = `
module.exports = {
  schema: "./env.d.ts",
  files: ".env"
};
`;
      fs.writeFileSync(configPath, configContent);

      // TODO: should throw error with more specific message
      await expect(loadConfig(configPath)).rejects.toThrow("files");
    });

    it("should handle config with named export", async () => {
      const configPath = path.join(testConfigDir, "named-export.config.ts");
      const configContent = `
export const schema = "./env.d.ts";
export const files = ["**/*.env"];
`;
      fs.writeFileSync(configPath, configContent);

      const config = await loadConfig(configPath);

      expect(config).toEqual({
        schema: "./env.d.ts",
        files: ["**/*.env"],
      });
    });
  });
});
