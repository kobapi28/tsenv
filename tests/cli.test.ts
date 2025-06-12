import * as fs from "node:fs";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkCommand } from "../src/commands/check";

describe("CLI commands", () => {
  const testDir = "/tmp/tsenv-test-cli";
  let mockExit: ReturnType<typeof vi.spyOn>;
  let mockConsoleLog: ReturnType<typeof vi.spyOn>;
  let mockConsoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    mockExit = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
    mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
    mockConsoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    mockExit.mockRestore();
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe("check command", () => {
    it("should validate env files against schema successfully", async () => {
      const configPath = path.join(testDir, "tsenv.config.js");
      const schemaPath = path.join(testDir, "env.d.ts");
      const envPath = path.join(testDir, ".env");

      const configContent = `
module.exports = {
  schema: "${schemaPath}",
  files: ["${envPath}"]
};
`;
      fs.writeFileSync(configPath, configContent);

      const schemaContent = `
type Env = {
  API_KEY: string;
  PORT: number;
  DEBUG: boolean;
};
`;
      fs.writeFileSync(schemaPath, schemaContent);

      const envContent = `
API_KEY=secret123
PORT=3000
DEBUG=true
`;
      fs.writeFileSync(envPath, envContent);

      await checkCommand({ config: configPath });

      expect(mockExit).not.toHaveBeenCalled();
    });

    it("should exit with error code when validation fails", async () => {
      const configPath = path.join(testDir, "tsenv.config.js");
      const schemaPath = path.join(testDir, "env.d.ts");
      const envPath = path.join(testDir, ".env");

      const configContent = `
module.exports = {
  schema: "${schemaPath}",
  files: ["${envPath}"]
};
`;
      fs.writeFileSync(configPath, configContent);

      const schemaContent = `
type Env = {
  API_KEY: string;
  PORT: number;
  DEBUG: boolean;
};
`;
      fs.writeFileSync(schemaPath, schemaContent);

      const envContent = `
API_KEY=secret123
PORT=not_a_number
DEBUG=not_a_boolean
`;
      fs.writeFileSync(envPath, envContent);

      await checkCommand({ config: configPath });

      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it("should handle missing required environment variables", async () => {
      const configPath = path.join(testDir, "tsenv.config.js");
      const schemaPath = path.join(testDir, "env.d.ts");
      const envPath = path.join(testDir, ".env");

      const configContent = `
module.exports = {
  schema: "${schemaPath}",
  files: ["${envPath}"]
};
`;
      fs.writeFileSync(configPath, configContent);

      const schemaContent = `
type Env = {
  API_KEY: string;
  PORT: number;
  DEBUG: boolean;
  REQUIRED_VAR: string;
};
`;
      fs.writeFileSync(schemaPath, schemaContent);

      const envContent = `
API_KEY=secret123
PORT=3000
DEBUG=true
`;
      fs.writeFileSync(envPath, envContent);

      await checkCommand({ config: configPath });

      expect(mockExit).toHaveBeenCalledWith(1);
    });

    // TODO: fix this test
    //     it("should handle file patterns with glob", async () => {
    //       const configPath = path.join(testDir, "tsenv.config.js");
    //       const schemaPath = path.join(testDir, "env.d.ts");
    //       const envPath = path.join(testDir, ".env");
    //       const envLocalPath = path.join(testDir, ".env.local");

    //       const configContent = `
    // module.exports = {
    //   schema: "${schemaPath}",
    //   files: ["${testDir}/.env*"]
    // };
    // `;
    //       fs.writeFileSync(configPath, configContent);

    //       const schemaContent = `
    // type Env = {
    //   API_KEY: string;
    // };
    // `;
    //       fs.writeFileSync(schemaPath, schemaContent);

    //       const envContent = "API_KEY=secret123";
    //       fs.writeFileSync(envPath, envContent);

    //       const envLocalContent = "";
    //       fs.writeFileSync(envLocalPath, envLocalContent);

    //       await checkCommand({ config: configPath });

    //       expect(mockExit).toHaveBeenCalledWith(1);
    //     });

    it("should handle undefined variables in env files", async () => {
      const configPath = path.join(testDir, "tsenv.config.js");
      const schemaPath = path.join(testDir, "env.d.ts");
      const envPath = path.join(testDir, ".env");

      const configContent = `
module.exports = {
  schema: "${schemaPath}",
  files: ["${envPath}"]
};
`;
      fs.writeFileSync(configPath, configContent);

      const schemaContent = `
type Env = {
  API_KEY: string;
};
`;
      fs.writeFileSync(schemaPath, schemaContent);

      const envContent = `
API_KEY=secret123
UNDEFINED_VAR=some_value
ANOTHER_UNDEFINED=another_value
`;
      fs.writeFileSync(envPath, envContent);

      await checkCommand({ config: configPath });

      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it("should exit with error when config file is not found", async () => {
      const nonExistentConfig = path.join(testDir, "non-existent.config.js");

      await checkCommand({ config: nonExistentConfig });

      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it("should handle empty env files gracefully", async () => {
      const configPath = path.join(testDir, "tsenv.config.js");
      const schemaPath = path.join(testDir, "env.d.ts");
      const envPath = path.join(testDir, ".env");

      const configContent = `
module.exports = {
  schema: "${schemaPath}",
  files: ["${envPath}"]
};
`;
      fs.writeFileSync(configPath, configContent);

      const schemaContent = `
type Env = {
  OPTIONAL_VAR?: string;
};
`;
      fs.writeFileSync(schemaPath, schemaContent);

      fs.writeFileSync(envPath, "");

      await checkCommand({ config: configPath });

      expect(mockExit).not.toHaveBeenCalled();
    });

    it("should throw error when no files match pattern", async () => {
      const configPath = path.join(testDir, "tsenv.config.js");
      const schemaPath = path.join(testDir, "env.d.ts");

      const configContent = `
module.exports = {
  schema: "${schemaPath}",
  files: ["${testDir}/non-existent-*.env"]
};
`;
      fs.writeFileSync(configPath, configContent);

      const schemaContent = `
type Env = {
  API_KEY: string;
};
`;
      fs.writeFileSync(schemaPath, schemaContent);

      await checkCommand({ config: configPath });

      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
});
