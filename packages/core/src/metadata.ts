import "reflect-metadata";
import {
  FieldOptions,
  ModelOptions,
  RelationOptions,
  ValidationRule,
} from "@osb/types";

// =====================
// Keys for metadata
// =====================
const FIELDS_KEY = "osb:fields";
const MODEL_KEY = "osb:model";
const RELATIONS_KEY = "osb:relations";
const VALIDATIONS_KEY = "osb:validations";

// =====================
// Fields
// =====================
export function defineField(
  model: Function,
  property: string,
  options: FieldOptions
) {
  const fields: Record<string, FieldOptions> =
    Reflect.getMetadata(FIELDS_KEY, model) || {};
  fields[property] = options;
  Reflect.defineMetadata(FIELDS_KEY, fields, model);
}

export function getFields(model: Function): Record<string, FieldOptions> {
  return Reflect.getMetadata(FIELDS_KEY, model) || {};
}

// =====================
// Models
// =====================
export function defineModel(model: Function, options: ModelOptions) {
  Reflect.defineMetadata(MODEL_KEY, options, model);
}

export function getModel(model: Function): ModelOptions | undefined {
  return Reflect.getMetadata(MODEL_KEY, model);
}

// =====================
// Relations
// =====================
export function defineRelation(
  model: Function,
  property: string,
  options: RelationOptions
) {
  const relations: Record<string, RelationOptions> =
    Reflect.getMetadata(RELATIONS_KEY, model) || {};
  relations[property] = options;
  Reflect.defineMetadata(RELATIONS_KEY, relations, model);
}

export function getRelations(model: Function): Record<string, RelationOptions> {
  return Reflect.getMetadata(RELATIONS_KEY, model) || {};
}

// =====================
// Validations
// =====================
export function defineValidation(
  model: Function,
  property: string,
  rules: ValidationRule[]
) {
  const validations: Record<string, ValidationRule[]> =
    Reflect.getMetadata(VALIDATIONS_KEY, model) || {};
  validations[property] = (validations[property] || []).concat(rules);
  Reflect.defineMetadata(VALIDATIONS_KEY, validations, model);
}

export function getValidations(
  model: Function
): Record<string, ValidationRule[]> {
  return Reflect.getMetadata(VALIDATIONS_KEY, model) || {};
}

// =====================
// Enums
// =====================
const enumMetadata = new Map<Function, Record<string, object>>();

export function defineEnum(
  target: Function,
  propertyKey: string,
  enumObj: object
) {
  if (!enumMetadata.has(target)) {
    enumMetadata.set(target, {});
  }

  const existing = enumMetadata.get(target)!;
  existing[propertyKey] = enumObj;
}

// Helper to retrieve enums for a model
export function getEnums(model: Function): Record<string, object> | undefined {
  return enumMetadata.get(model);
}
