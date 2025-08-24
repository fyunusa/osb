// cli/packages/decorators/src/enums.ts
import "reflect-metadata";
import { defineEnum } from "@osb/core";

/**
 * Enum decorator
 * @param enumObj The enum object
 */
export function Enum(enumObj: object): PropertyDecorator {
  return (target, propertyKey) => {
    defineEnum(target.constructor, propertyKey.toString(), enumObj);
  };
}
