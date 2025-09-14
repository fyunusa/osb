import {
  swaggerImports,
  swaggerFindAll,
  swaggerFindOne,
  swaggerCreate,
  swaggerUpdate,
  swaggerRemove,
} from "../utils/swagger-controller-utils";

export function generateController(
  model: Function,
  useSwagger: boolean = false
): string {
  const modelName = model.name;
  const lowerName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  const entityName = `${modelName}Entity`;
  const serviceName = `${modelName}Service`;
  const inputDto = `${modelName}InputDto`;
  const updateDto = `${modelName}UpdateDto`;
  const outputDto = `${modelName}OutputDto`;

  return `
import { ${entityName} } from "../entities/${modelName}.entity";
import { ${serviceName} } from "../services/${modelName}.service";
import { ${inputDto} } from "../dtos/${modelName}.inputDto";
import { ${updateDto} } from "../dtos/${modelName}.updateDto";
import { ${outputDto} } from "../dtos/${modelName}.outputDto";
${swaggerImports(useSwagger)}

export class ${modelName}Controller {
  constructor(
    private readonly service: ${serviceName}
  ) {}

  ${swaggerFindAll(useSwagger, lowerName)}
  async findAll(): Promise<${outputDto}[]> {
    return await this.service.findAll();
  }

  ${swaggerFindOne(useSwagger, lowerName)}
  async findOne(id: string): Promise<${outputDto} | null> {
    return await this.service.findOne(id);
  }

  ${swaggerCreate(useSwagger, lowerName)}
  async create(input: ${inputDto}): Promise<${outputDto}> {
    return await this.service.create(input);
  }

  ${swaggerUpdate(useSwagger, lowerName)}
  async update(id: string, input: ${updateDto}): Promise<${outputDto} | null> {
    return await this.service.update(id, input);
  }

  ${swaggerRemove(useSwagger, lowerName)}
  async remove(id: string): Promise<boolean> {
    return await this.service.remove(id);
  }
}
`;
}
