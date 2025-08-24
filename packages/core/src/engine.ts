import { EngineOptions } from "@osb/types";
import { BaseEngine } from "./engines/baseEngine";
import { TypeOrmEngine } from "./engines/typeOrmEngine";

export class OSBEngine {
  private static engine: BaseEngine | TypeOrmEngine;

  static init(options: EngineOptions) {
    const opts: EngineOptions = {
      useSwagger: false,
      useTypeOrm: false,
      ...options,
    };

    // Decide engine type
    if (opts.useTypeOrm) {
      this.engine = new TypeOrmEngine(opts);
    } else {
      this.engine = new BaseEngine(opts);
    }
  }

  static writeEntities(model: Function) {
    this.engine.writeEntities(model);
  }

  static writeDTOs(model: Function) {
    this.engine.writeDTOs(model);
  }

  static writeController(model: Function) {
    this.engine.writeController(model);
  }

  static writeService(model: Function) {
    this.engine.writeService(model);
  }

  static writeEnums(model: Function) {
    this.engine.writeEnums(model);
  }

  static writeAll(model: Function) {
    this.engine.writeAll(model);
  }
}
