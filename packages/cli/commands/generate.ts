import { Command } from "commander";
import { OSBEngine } from "../../core";
import * as path from "path";
import fs from "fs";

export function generateCommand(program: Command) {
  program
    .command("generate <type> <name>")
    .description(
      "Generate scaffolds: entity | dto | controller | service | enums | all"
    )
    .option(
      "-m, --modelPath <path>",
      "Path to the model file (absolute or relative)",
      "src/models"
    )
    .option("--use-swagger [value]", "Enable Swagger decorators", false)
    .option("--use-typeorm [value]", "Use TypeORM engine", false)
    .action(async (type, name, opts) => {
      let modelFile: string;
      let parentDir: string;

      const providedPath = path.resolve(process.cwd(), opts.modelPath);
      if (fs.existsSync(providedPath) && fs.statSync(providedPath).isFile()) {
        modelFile = providedPath;
        parentDir = path.dirname(modelFile); // Use parent folder
      } else {
        modelFile = path.join(providedPath, `${name}`);
        if (fs.existsSync(`${modelFile}.ts`)) modelFile += ".ts";
        else if (fs.existsSync(`${modelFile}.js`)) modelFile += ".js";
        else {
          console.error(
            `Could not find ${name}.ts or ${name}.js in ${providedPath}`
          );
          process.exit(1);
        }
        parentDir = providedPath;
      }

      try {
        // Initialize OSBEngine if not already
        if (!OSBEngine["engine"]) {
          OSBEngine.init({
            basePath: path.resolve(parentDir),
            useSwagger: opts.useSwagger,
            useTypeOrm: opts.useTypeorm,
          });
        }

        // TS auto-detect
        // if (modelFile.endsWith(".ts")) {
        //   require("ts-node").register();
        // }
        // WITH THIS IMPROVED TS-NODE CONFIGURATION:
        if (modelFile.endsWith(".ts")) {
          require("ts-node").register({
            compilerOptions: {
              // Use string values instead of enum references
              target: "ES2020",
              module: "CommonJS",
              moduleResolution: "Node",
              esModuleInterop: true,
              experimentalDecorators: true,
              emitDecoratorMetadata: true,
              // Map osbts/decorators to node_modules
              paths: {
                "osbts/decorators": [
                  "./node_modules/osbts/dist/packages/decorators/index",
                ],
              },
              baseUrl: process.cwd(),
            },
            transpileOnly: true,
          });
        }

        const module = await import(modelFile);
        const Model = module[name] || module.default;

        console.log(`Loaded model "${name}" from ${modelFile}`);

        if (!Model) {
          console.error(`Could not find model "${name}" in ${modelFile}`);
          process.exit(1);
        }

        switch (type) {
          case "entity":
            OSBEngine.writeEntities(Model);
            break;
          case "dto":
          case "dtos":
            OSBEngine.writeDTOs(Model);
            break;
          case "controller":
            OSBEngine.writeController(Model);
            break;
          case "service":
            OSBEngine.writeService(Model);
            break;
          case "enums":
            OSBEngine.writeEnums(Model);
            break;
          case "all":
            OSBEngine.writeAll(Model);
            break;
          default:
            console.error(`Unknown type: ${type}`);
        }
      } catch (err) {
        console.error(`Failed to load model at ${modelFile}`);
        console.error(err);
        process.exit(1);
      }
    });
}
