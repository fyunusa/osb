export function swaggerImports(useSwagger: boolean): string {
  return useSwagger
    ? `import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';\n`
    : "";
}

export function swaggerProperty(
  useSwagger: boolean,
  name: string,
  type: string,
  required: boolean
): string {
  if (!useSwagger) return "";

  const decorator = required ? "ApiProperty" : "ApiPropertyOptional";

  const exampleValue =
    type === "string"
      ? `"example-${name}"`
      : type === "number"
      ? 123
      : type === "boolean"
      ? true
      : `{}`;

  return `  @${decorator}({ example: ${exampleValue} })\n`;
}
