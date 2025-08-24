import "reflect-metadata";
import { defineField, defineEnum } from "../core";
import { FieldOptions } from "../types";

export function Field(options: FieldOptions = {}): PropertyDecorator {
  return (target, propertyKey) => {
    defineField(target.constructor, propertyKey.toString(), options);

    if (options.enum) {
      // Use your existing defineEnum helper
      defineEnum(target.constructor, propertyKey.toString(), options.enum);
    }
  };
}
