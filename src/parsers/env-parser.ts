import * as fs from "node:fs";
import * as path from "node:path";
import { parse } from "dotenv";

export interface EnvVariable {
  key: string;
  value: string;
  line: number;
  file: string;
}

export function parseEnvFile(filePath: string): EnvVariable[] {
  const absolutePath = path.resolve(filePath);
  const content = fs.readFileSync(absolutePath, "utf-8");
  const lines = content.split("\n");

  const parsed = parse(content);
  const variables: EnvVariable[] = [];

  let currentKey: string | null = null;
  let startLine = 0;
  let inMultiline = false;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Skip empty lines and comments when not in multiline
    if (!inMultiline && (!trimmed || trimmed.startsWith("#"))) {
      return;
    }

    // Check if this line starts a new variable assignment
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !inMultiline) {
      const key = match[1].trim();
      const value = match[2];

      // Check if this starts a multiline value (quoted and not closed)
      if (
        (value.startsWith('"') && !value.endsWith('"')) ||
        (value.startsWith("'") && !value.endsWith("'"))
      ) {
        currentKey = key;
        startLine = index + 1;
        inMultiline = true;
      } else if (parsed[key] !== undefined) {
        // Single line variable
        variables.push({
          key,
          value: parsed[key],
          line: index + 1,
          file: absolutePath,
        });
      }
    } else if (inMultiline && currentKey) {
      // Check if this line ends the multiline value
      const currentValue = parsed[currentKey];
      if (currentValue !== undefined) {
        // The multiline value is complete, add it
        variables.push({
          key: currentKey,
          value: currentValue,
          line: startLine,
          file: absolutePath,
        });
        currentKey = null;
        inMultiline = false;
      }
    }
  });

  // Handle case where multiline value extends to end of file
  if (inMultiline && currentKey && parsed[currentKey] !== undefined) {
    variables.push({
      key: currentKey,
      value: parsed[currentKey],
      line: startLine,
      file: absolutePath,
    });
  }

  return variables;
}
