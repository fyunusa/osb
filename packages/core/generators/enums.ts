import { getEnums } from "../metadata";

export function generateEnums(model: Function): string {
  const enums = getEnums(model);
  if (!enums) return `// No enums defined for ${model.name}`;

  let code = `// Enums for ${model.name}\n\n`;

  for (const [prop, enumObj] of Object.entries(enums)) {
    const enumName = `${model.name}${
      prop.charAt(0).toUpperCase() + prop.slice(1)
    }Enum`;
    const enumValues = Object.entries(enumObj)
      .map(([key, val]) => `  ${key} = "${val}"`)
      .join(",\n");
    code += `export enum ${enumName} {\n${enumValues}\n}\n\n`;
  }

  return code;
}
