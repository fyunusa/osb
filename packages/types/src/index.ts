export interface EngineOptions {
  basePath: string;
  useSwagger?: boolean;
  useTypeOrm?: boolean;
}

export interface ModelOptions {
  name?: string;
  table?: string;
}

export interface RelationOptions {
  type: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
  target: string | Function;
}

export interface ValidationRule {
  rule: string;
  value?: any;
  message?: string;
}

export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "json"
  | "uuid"
  | "float"
  | "decimal"
  | "text"
  | "enum";

export interface FieldOptions {
  type?: FieldType;
  primary?: boolean;
  unique?: boolean;
  required?: boolean;
  default?: any;
  length?: number;
  precision?: number;
  scale?: number;
  enumValues?: string[];
  enum?: object;
  index?: boolean;
  description?: string;
  isArray?: boolean;
}
