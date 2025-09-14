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

// Determine which validators are needed for a field
function getValidatorsForField(
  model: Function,
  fieldName: string,
  type?: string,
  isArray: boolean = false
): Set<string> {
  const validators = new Set<string>();
  const enums = getEnums(model);
  
  validators.add("IsOptional");
  
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

  // Track which validators are needed
  const inputValidators = new Set<string>();
  const updateValidators = new Set<string>();

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
      const fieldValidators = getValidatorsForField(
        model,
        name,
        opts.type,
        opts.isArray
      );
      // Add all needed validators to our set
      fieldValidators.forEach((v) => inputValidators.add(v));

      return `${swaggerProperty(useSwagger, name, type, true)}${enumValidator(
        model,
        name,
        opts.isArray
      )}  ${name}: ${type};`;
    })
    .join("\n");

  const updateFields = Object.entries(fields)
    .map(([name, opts]) => {
      const type = mapFieldType(model, name, opts.type);
      const fieldValidators = getValidatorsForField(
        model,
        name,
        opts.type,
        opts.isArray
      );
      // Add all needed validators to our set
      fieldValidators.forEach((v) => updateValidators.add(v));

      return `${swaggerProperty(useSwagger, name, type, false)}${enumValidator(
        model,
        name,
        opts.isArray
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
      )}${exposeProperty()}${enumValidator(
        model,
        name,
        opts.isArray
      )}  ${name}: ${type};`;
    })
    .join("\n");

  // Create the specific imports needed for each DTO
  const inputValidatorImports = `import { ${Array.from(inputValidators).join(
    ", "
  )} } from "class-validator";\n`;
  const updateValidatorImports = `import { ${Array.from(updateValidators).join(
    ", "
  )} } from "class-validator";\n`;
  const swagger = swaggerImports(useSwagger);

  return {
    inputDto: `${enumImport}${swagger}${inputValidatorImports}\nexport class ${modelName}InputDto {\n${inputFields}\n}`,
    updateDto: `${enumImport}${swagger}${updateValidatorImports}\nexport class ${modelName}UpdateDto {\n${updateFields}\n}`,
    outputDto: `${enumImport}${swagger}import { Expose } from 'class-transformer';\nexport class ${modelName}OutputDto {\n${outputFields}\n}`,
  };
}
