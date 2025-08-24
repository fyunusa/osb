import { getFields, getEnums } from "../metadata";
import { swaggerProperty, swaggerImports } from "../utils/swagger-dto-utils";

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function mapFieldType(
  model: Function,
  fieldName: string,
  type?: string
): string {
  const enums = getEnums(model);
  if (enums && enums[fieldName]) {
    return `${model.name}${capitalize(fieldName)}Enum`;
  }

  switch (type) {
    case "string":
    case "uuid":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "date":
      return "Date";
    case "json":
      return "any";
    case undefined:
      return "string";
    default:
      return "any";
  }
}

function enumValidator(
  model: Function,
  fieldName: string,
  isArray: boolean = false
): string {
  const enums = getEnums(model);
  if (enums && enums[fieldName]) {
    const enumType = `${model.name}${capitalize(fieldName)}Enum`;
    return isArray
      ? `  @IsArray()\n  @IsOptional()\n  @IsEnum(${enumType}, { each: true })\n`
      : `  @IsOptional()\n  @IsEnum(${enumType})\n`;
  }
  return "";
}

function mapValidator(type?: string, required = true): string[] {
  const decorators: string[] = [];

  if (!required) {
    decorators.push("@IsOptional()");
  }

  switch (type) {
    case "string":
    case "uuid":
    case undefined:
      decorators.push("@IsString()");
      break;
    case "number":
      decorators.push("@IsNumber()");
      break;
    case "boolean":
      decorators.push("@IsBoolean()");
      break;
    case "date":
      decorators.push("@IsDate()");
      break;
    case "json":
      decorators.push("@IsObject()");
      break;
  }

  return decorators;
}

export interface DTOs {
  inputDto: string;
  updateDto: string;
  outputDto: string;
}

export function generateDTOs(
  model: Function,
  useSwagger: boolean = false
): DTOs {
  const modelName = model.name;
  const fields = getFields(model);
  const enums = getEnums(model);

  // Generate enum import statement if there are enums
  let enumImport = "";
  if (enums) {
    const enumNames = Object.keys(enums)
      .map((field) => `${modelName}${capitalize(field)}Enum`)
      .join(", ");
    enumImport = `import { ${enumNames} } from "../enums/${modelName}.enums";\n`;
  }

  const buildFields = (required: boolean, swaggerRequired: boolean): string =>
    Object.entries(fields)
      .filter(([_, opts]) => required || !opts.required)
      .map(([name, opts]) => {
        const tsType = mapFieldType(model, name, opts.type);
        const decorators = [
          ...mapValidator(opts.type, required && opts.required),
          enumValidator(model, name, Array.isArray(opts.default)),
          swaggerProperty(useSwagger, name, tsType, swaggerRequired),
        ]
          .filter(Boolean)
          .join("\n  ");

        return `  ${decorators}\n  ${name}${required ? "" : "?"}: ${tsType};`;
      })
      .join("\n\n");

  const inputFields = buildFields(true, true);
  const updateFields = buildFields(false, false);
  const outputFields = Object.entries(fields)
    .map(([name, opts]) => {
      const tsType = mapFieldType(model, name, opts.type);
      const decorators = [
        swaggerProperty(useSwagger, name, tsType, true),
        enumValidator(model, name),
      ]
        .filter(Boolean)
        .join("\n  ");
      return `  ${decorators}\n  ${name}: ${tsType};`;
    })
    .join("\n\n");

  const validatorImports = `import { IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsObject, IsEnum, IsArray } from "class-validator";\n`;
  const swagger = swaggerImports(useSwagger);

  return {
    inputDto: `${enumImport}${swagger}${validatorImports}\nexport class ${modelName}InputDto {\n${inputFields}\n}`,
    updateDto: `${enumImport}${swagger}${validatorImports}\nexport class ${modelName}UpdateDto {\n${updateFields}\n}`,
    outputDto: `${enumImport}${swagger}\nexport class ${modelName}OutputDto {\n${outputFields}\n}`,
  };
}
