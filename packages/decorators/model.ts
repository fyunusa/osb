import "reflect-metadata";
import { defineModel } from "../core";
import { ModelOptions } from "../types";

export function Model(options: ModelOptions = {}): ClassDecorator {
  return (target) => {
    const callerFile = module.parent?.filename || process.cwd();

    (target as any).__filePath = callerFile;
    defineModel(target, options);
  };
}
