import * as fs from "fs";
import * as path from "path";
import {
  generateEntity,
  generateDTOs,
  generateController,
  generateEnums,
  generateService,
} from "../generators-typeorm";
import { EngineOptions } from "../../types";

export class TypeOrmEngine {
  constructor(private options: EngineOptions) {}

  writeEntities(model: Function) {
    const code = generateEntity(model);
    this.writeFile(
      path.join(this.options.basePath, "entities"),
      `${model.name}.entity.ts`,
      code
    );
  }

  writeDTOs(model: Function) {
    const dtos = generateDTOs(model, this.options.useSwagger);
    const dtoDir = path.join(this.options.basePath, "dtos");
    Object.entries(dtos).forEach(([name, code]) => {
      this.writeFile(dtoDir, `${model.name}.${name}.ts`, code!);
    });
  }

  writeController(model: Function) {
    const code = generateController(model, this.options.useSwagger);
    this.writeFile(
      path.join(this.options.basePath, "controllers"),
      `${model.name}.controller.ts`,
      code
    );
  }

  writeService(model: Function) {
    const code = generateService(model);
    this.writeFile(
      path.join(this.options.basePath, "services"),
      `${model.name}.service.ts`,
      code
    );
  }

  writeEnums(model: Function) {
    const code = generateEnums(model);
    this.writeFile(
      path.join(this.options.basePath, "enums"),
      `${model.name}.enums.ts`,
      code
    );
  }

  writeAll(model: Function) {
    this.writeEntities(model);
    this.writeDTOs(model);
    this.writeController(model);
    this.writeService(model);
    this.writeEnums(model);
  }

  private writeFile(dir: string, filename: string, content: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, filename), content);
    console.log(`Generated (TypeORM): ${path.join(dir, filename)}`);
  }
}
