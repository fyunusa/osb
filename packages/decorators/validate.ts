import "reflect-metadata";
import { defineValidation } from "../core";
import { ValidationRule } from "../types";

export function Validate(
  rules: ValidationRule | ValidationRule[]
): PropertyDecorator {
  return (target, propertyKey) => {
    const rulesArray = Array.isArray(rules) ? rules : [rules];
    defineValidation(target.constructor, propertyKey.toString(), rulesArray);
  };
}
