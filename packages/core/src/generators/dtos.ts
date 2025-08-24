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

export interface DTOs {
  inputDto: string;
  updateDto: string;
  outputDto: string;
}

function exposeProperty(): string {
  return `  @Expose()\n`;
}

export function generateDTOs(
  model: Function,
  useSwagger: boolean = false
): DTOs {
  const modelName = model.name;
  const fields = getFields(model);
  const enums = getEnums(model);

  // Generate enum imports if any
  let enumImport = "";
  if (enums) {
    const enumNames = Object.keys(enums)
      .map((field) => `${modelName}${capitalize(field)}Enum`)
      .join(", ");
    enumImport = `import { ${enumNames} } from "../enums/${modelName}.enums";\n`;
  }

  const inputFields = Object.entries(fields)
    .map(([name, opts]) => {
      const type = mapFieldType(model, name, opts.type);
      return `${swaggerProperty(useSwagger, name, type, true)}${enumValidator(
        model,
        name
      )}  ${name}: ${type};`;
    })
    .join("\n");

  const updateFields = Object.entries(fields)
    .map(([name, opts]) => {
      const type = mapFieldType(model, name, opts.type);
      return `${swaggerProperty(useSwagger, name, type, false)}${enumValidator(
        model,
        name
      )}  ${name}?: ${type};`;
    })
    .join("\n");

  const outputFields = Object.entries(fields)
    .map(([name, opts]) => {
      const type = mapFieldType(model, name, opts.type);
      return `${swaggerProperty(
        useSwagger,
        name,
        type,
        true
      )}${exposeProperty()}${enumValidator(model, name)}  ${name}: ${type};`;
    })
    .join("\n");

  const validatorImports = `import { IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsObject, IsEnum, IsArray } from "class-validator";\n`;
  const swagger = swaggerImports(useSwagger);

  return {
    inputDto: `${enumImport}${swagger}${validatorImports}\nexport class ${modelName}InputDto {\n${inputFields}\n}`,
    updateDto: `${enumImport}${swagger}${validatorImports}\nexport class ${modelName}UpdateDto {\n${updateFields}\n}`,
    outputDto: `${enumImport}${swagger}import { Expose } from 'class-transformer';\nexport class ${modelName}OutputDto {\n${outputFields}\n}`,
  };
}
