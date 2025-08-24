import { getFields, getEnums } from "../metadata";

function mapFieldType(
  model: Function,
  fieldName: string,
  type?: string
): string {
  const enums = getEnums(model);
  if (enums && enums[fieldName]) {
    // If field has an enum, generate a type based on enum name
    return `${model.name}${capitalize(fieldName)}Enum`;
  }

  switch (type) {
    case "string":
    case undefined:
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "date":
      return "Date";
    case "uuid":
      return "string";
    case "json":
      return "any";
    default:
      return "any";
  }
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function generateEntity(model: Function): string {
  const modelName = model.name;
  const fields = getFields(model);
  const enums = getEnums(model);

  // Generate imports for enums if present
  let enumImport = "";
  if (enums) {
    const enumNames = Object.keys(enums)
      .map((field) => `${modelName}${capitalize(field)}Enum`)
      .join(", ");
    enumImport = `import { ${enumNames} } from "../enums/${modelName}.enums";\n\n`;
  }

  // Generate entity fields
  const entityFields = Object.entries(fields)
    .map(
      ([name, opts]) => `  ${name}: ${mapFieldType(model, name, opts.type)};`
    )
    .join("\n");

  return `${enumImport}export class ${modelName}Entity {\n${entityFields}\n}`;
}
