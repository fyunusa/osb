import "reflect-metadata";
import { defineRelation } from "../core";
import { RelationOptions } from "../types";

export type RelationType =
  | "one-to-one"
  | "one-to-many"
  | "many-to-one"
  | "many-to-many";

function makeRelation(type: RelationType) {
  return (
    targetFn: () => Function,
    options: Omit<RelationOptions, "type" | "target"> = {}
  ): PropertyDecorator => {
    return (target, propertyKey) => {
      defineRelation(target.constructor, propertyKey.toString(), {
        type,
        target: targetFn,
        ...options,
      });
    };
  };
}

export const OneToOne = (
  target: () => Function,
  options?: Omit<RelationOptions, "type">
) => makeRelation("one-to-one")(target, options);

export const OneToMany = (
  target: () => Function,
  options?: Omit<RelationOptions, "type">
) => makeRelation("one-to-many")(target, options);

export const ManyToOne = (
  target: () => Function,
  options?: Omit<RelationOptions, "type">
) => makeRelation("many-to-one")(target, options);

export const ManyToMany = (
  target: () => Function,
  options?: Omit<RelationOptions, "type">
) => makeRelation("many-to-many")(target, options);
