import * as fs from "node:fs";
import * as path from "node:path";
import * as ts from "typescript";

export interface SchemaField {
  name: string;
  type: string;
  optional: boolean;
}

export interface Schema {
  fields: SchemaField[];
}

export function parseSchemaFile(schemaPath: string): Schema {
  const absolutePath = path.resolve(schemaPath);
  const sourceFile = ts.createSourceFile(
    absolutePath,
    fs.readFileSync(absolutePath, "utf-8"),
    ts.ScriptTarget.Latest,
    true,
  );

  const schema: Schema = { fields: [] };
  let foundEnvType = false;

  function visit(node: ts.Node) {
    // Handle type Env = { ... }
    if (ts.isTypeAliasDeclaration(node) && node.name.text === "Env") {
      foundEnvType = true;
      if (ts.isTypeLiteralNode(node.type)) {
        extractFieldsFromTypeLiteral(node.type);
      }
    }

    ts.forEachChild(node, visit);
  }

  function extractFieldsFromTypeLiteral(typeLiteral: ts.TypeLiteralNode) {
    for (const member of typeLiteral.members) {
      if (
        ts.isPropertySignature(member) &&
        member.name &&
        ts.isIdentifier(member.name)
      ) {
        const fieldName = member.name.text;
        const optional = !!member.questionToken;
        const fieldType = member.type ? getTypeString(member.type) : "any";

        schema.fields.push({
          name: fieldName,
          type: fieldType,
          optional,
        });
      }
    }
  }

  visit(sourceFile);

  if (!foundEnvType) {
    throw new Error(`No 'Env' type declaration found in ${schemaPath}`);
  }

  return schema;
}

function getTypeString(node: ts.TypeNode): string {
  if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal)) {
    return "string";
  }

  if (node.kind === ts.SyntaxKind.StringKeyword) {
    return "string";
  }

  if (node.kind === ts.SyntaxKind.NumberKeyword) {
    return "number";
  }

  if (node.kind === ts.SyntaxKind.BooleanKeyword) {
    return "boolean";
  }

  if (ts.isUnionTypeNode(node)) {
    const types = node.types.map((t) => getTypeString(t));
    return types.join(" | ");
  }

  return "unknown";
}
