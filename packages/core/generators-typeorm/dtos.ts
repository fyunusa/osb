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

// Determine which validators are needed for a field
function getValidatorsForField(
  model: Function,
  fieldName: string,
  type?: string,
  isArray: boolean = false,
  required: boolean = true
): Set<string> {
  const validators = new Set<string>();
  const enums = getEnums(model);
  
  if (!required) {
    validators.add("IsOptional");
  }
  
  if (enums && enums[fieldName]) {
    validators.add("IsEnum");
    if (isArray) validators.add("IsArray");
    return validators;
  }
  
  switch (type) {
    case "string":
    case "uuid":
    case undefined:
      validators.add("IsString");
      break;
    case "number":
      validators.add("IsNumber");
      break;
    case "boolean":
      validators.add("IsBoolean");
      break;
    case "date":
      validators.add("IsDate");
      break;
    case "json":
      validators.add("IsObject");
      break;
  }
  
  return validators;
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

  // Track which validators are needed
  const inputValidators = new Set<string>();
  const updateValidators = new Set<string>();

  // Generate enum import statement if there are enums
  let enumImport = "";
  if (enums) {
    const enumNames = Object.keys(enums)
      .map((field) => `${modelName}${capitalize(field)}Enum`)
      .join(", ");
    enumImport = `import { ${enumNames} } from "../enums/${modelName}.enums";\n`;
  }

  // Collect needed validators during field building
  const buildFields = (required: boolean, swaggerRequired: boolean): string => {
    return Object.entries(fields)
      .filter(([_, opts]) => required || !opts.required)
      .map(([name, opts]) => {
        const tsType = mapFieldType(model, name, opts.type);
        const isArray = Array.isArray(opts.default);

        // Get validators and add them to the tracking set
        const fieldValidators = getValidatorsForField(
          model,
          name,
          opts.type,
          isArray,
          required && opts.required
        );

        // Add to the appropriate set based on which DTO we're building
        if (required) {
          fieldValidators.forEach((v) => inputValidators.add(v));
        } else {
          fieldValidators.forEach((v) => updateValidators.add(v));
        }

        const decorators = [
          ...mapValidator(opts.type, required && opts.required),
          enumValidator(model, name, isArray),
          swaggerProperty(useSwagger, name, tsType, swaggerRequired),
        ]
          .filter(Boolean)
          .join("\n  ");

        return `  ${decorators}\n  ${name}${required ? "" : "?"}: ${tsType};`;
      })
      .join("\n\n");
  };

  const inputFields = buildFields(true, true);
  const updateFields = buildFields(false, false);

  // Output fields don't need validators
  const outputFields = Object.entries(fields)
    .map(([name, opts]) => {
      const tsType = mapFieldType(model, name, opts.type);
      const decorators = [swaggerProperty(useSwagger, name, tsType, true)]
        .filter(Boolean)
        .join("\n  ");
      return `  ${decorators}\n  ${name}: ${tsType};`;
    })
    .join("\n\n");

  // Create specific validator imports for each DTO
  const inputValidatorImports =
    inputValidators.size > 0
      ? `import { ${Array.from(inputValidators).join(
          ", "
        )} } from "class-validator";\n`
      : "";

  const updateValidatorImports =
    updateValidators.size > 0
      ? `import { ${Array.from(updateValidators).join(
          ", "
        )} } from "class-validator";\n`
      : "";

  const swagger = swaggerImports(useSwagger);

  return {
    inputDto: `${enumImport}${swagger}${inputValidatorImports}\nexport class ${modelName}InputDto {\n${inputFields}\n}`,
    updateDto: `${enumImport}${swagger}${updateValidatorImports}\nexport class ${modelName}UpdateDto {\n${updateFields}\n}`,
    outputDto: `${enumImport}${swagger}\nexport class ${modelName}OutputDto {\n${outputFields}\n}`,
  };
}