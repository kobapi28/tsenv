import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'dotenv';

export interface EnvVariable {
  key: string;
  value: string;
  line: number;
  file: string;
}

export function parseEnvFile(filePath: string): EnvVariable[] {
  const absolutePath = path.resolve(filePath);
  const content = fs.readFileSync(absolutePath, 'utf-8');
  const lines = content.split('\n');
  
  const parsed = parse(content);
  const variables: EnvVariable[] = [];
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        if (parsed[key] !== undefined) {
          variables.push({
            key,
            value: parsed[key],
            line: index + 1,
            file: absolutePath
          });
        }
      }
    }
  });
  
  return variables;
}