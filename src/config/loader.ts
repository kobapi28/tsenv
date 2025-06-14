import * as fs from "node:fs";
import * as path from "node:path";

export interface TsEnvConfig {
  schema: string;
  files: string[];
}

export async function loadConfig(configPath: string): Promise<TsEnvConfig> {
  const absolutePath = path.resolve(configPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Config file not found: ${absolutePath}`);
  }

  try {
    // Try dynamic import first for TypeScript support
    const module = await import(`file://${absolutePath}`);

    if (!module.default && !module.schema) {
      throw new Error(
        "Config file must have a default export or export a config object",
      );
    }

    return validateConfig(module.default || module);
  } catch (error) {
    // Fallback to require for JS files
    try {
      // Clear require cache to ensure fresh load
      delete require.cache[absolutePath];
      const module = require(absolutePath);

      if (!module.default && !module.schema) {
        throw new Error(
          "Config file must have a default export or export a config object",
        );
      }

      return validateConfig(module.default || module);
    } catch (_requireError) {
      throw new Error(
        `Failed to load config file: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}

function validateConfig(config: unknown): TsEnvConfig {
  if (typeof config !== "object" || config === null) {
    throw new Error("Config must be an object");
  }

  const configObj = config as Record<string, unknown>;

  if (!configObj.schema || typeof configObj.schema !== "string") {
    throw new Error('Config must have a "schema" property with a string value');
  }

  if (!configObj.files || !Array.isArray(configObj.files)) {
    throw new Error('Config must have a "files" property with an array value');
  }

  return { schema: configObj.schema, files: configObj.files } as TsEnvConfig;
}
