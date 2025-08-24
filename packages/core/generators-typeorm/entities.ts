import { getFields, getEnums } from "../metadata";

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function mapColumnDecorator(model: Function, name: string, opts: any): string {
  const type = opts.type;
  const enums = getEnums(model);

  if (opts.primary) {
    if (type === "uuid") {
      return `  @PrimaryGeneratedColumn("uuid")\n  ${name}: string;`;
    }
    return `  @PrimaryGeneratedColumn()\n  ${name}: number;`;
  }

  // Enum column
  if (enums && enums[name]) {
    const enumType = `${model.name}${capitalize(name)}Enum`;
    return `  @Column({ type: "enum", enum: ${enumType}, nullable: ${!opts.required} })\n  ${name}: ${enumType};`;
  }

  switch (type) {
    case "string":
      return `  @Column({ type: "varchar" })\n  ${name}: string;`;
    case "number":
      return `  @Column({ type: "int" })\n  ${name}: number;`;
    case "boolean":
      return `  @Column({ type: "boolean" })\n  ${name}: boolean;`;
    case "date":
      return `  @Column({ type: "timestamp" })\n  ${name}: Date;`;
    case "uuid":
      return `  @Column({ type: "uuid" })\n  ${name}: string;`;
    case "json":
      return `  @Column({ type: "jsonb", nullable: true })\n  ${name}: any;`;
    default:
      return `  @Column({ nullable: true })\n  ${name}: any;`;
  }
}

export function generateEntity(model: Function): string {
  const modelName = model.name;
  const fields = getFields(model);
  const enums = getEnums(model);

  // Generate enum import if any enums exist
  let enumImport = "";
  if (enums) {
    const enumNames = Object.keys(enums)
      .map((field) => `${modelName}${capitalize(field)}Enum`)
      .join(", ");
    enumImport = `import { ${enumNames} } from "../enums/${modelName}.enums";\n`;
  }

  const entityFields = Object.entries(fields)
    .map(([name, opts]) => mapColumnDecorator(model, name, opts))
    .join("\n\n");

  return `${enumImport}import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("${modelName.toLowerCase()}")
export class ${modelName}Entity {
${entityFields ? entityFields + "\n\n" : ""}  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
`;
}
