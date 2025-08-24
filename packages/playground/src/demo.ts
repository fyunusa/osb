import { OSBEngine } from "../core";
import { Model, Field, Validate } from "@osb/decorators";
import * as path from "path";

// Initialize the engine with the base path for generated files
OSBEngine.init({
  basePath: path.resolve(process.cwd(), "src"),
  useSwagger: true,
});

@Model({ name: "User" })
class User {
  @Field({ primary: true, type: "uuid" })
  id!: string;

  @Field({ type: "string" })
  name!: string;

  @Validate({ rule: "required" })
  email!: string;
}

// Generate files automatically in entities/dtos under basePath
OSBEngine.writeAll(User);
