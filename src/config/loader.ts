import * as fs from 'fs';
import * as path from 'path';

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
    // Use require for both JS and TS files when running compiled code
    const module = require(absolutePath);
    
    if (!module.default && !module.schema) {
      throw new Error('Config file must have a default export or export a config object');
    }
    
    return validateConfig(module.default || module);
  } catch (error) {
    // If require fails, it might be because we're running with tsx
    // In that case, we need to compile the TypeScript file
    throw new Error(`Failed to load config file: ${error instanceof Error ? error.message : error}`);
  }
}

function validateConfig(config: any): TsEnvConfig {
  if (!config.schema || typeof config.schema !== 'string') {
    throw new Error('Config must have a "schema" property with a string value');
  }
  
  if (!config.files || !Array.isArray(config.files)) {
    throw new Error('Config must have a "files" property with an array value');
  }
  
  return config as TsEnvConfig;
}