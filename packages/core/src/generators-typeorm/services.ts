export function generateService(model: Function): string {
  const modelName = model.name;
  const entityName = `${modelName}Entity`;
  const inputDto = `${modelName}InputDto`;
  const updateDto = `${modelName}UpdateDto`;
  const outputDto = `${modelName}OutputDto`;

  return `
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";

import { ${entityName} } from "../entities/${modelName}.entity";
import { ${inputDto} } from "../dtos/${modelName}.inputDto";
import { ${updateDto} } from "../dtos/${modelName}.updateDto";
import { ${outputDto} } from "../dtos/${modelName}.outputDto";

export class ${modelName}Service {
  constructor(
    @InjectRepository(${entityName})
    private readonly repo: Repository<${entityName}>
  ) {}

  // Find all
  async findAll(): Promise<${outputDto}[]> {
    const items = await this.repo.find();
    return plainToInstance(${outputDto}, items, { excludeExtraneousValues: true });
  }

  // Find one
  async findOne(id: string): Promise<${outputDto} | null> {
    const entity = await this.repo.findOneBy({ id });
    return entity
      ? plainToInstance(${outputDto}, entity, { excludeExtraneousValues: true })
      : null;
  }

  // Create
  async create(dto: ${inputDto}): Promise<${outputDto}> {
    const entity = this.repo.create(dto);
    const saved = await this.repo.save(entity);
    return plainToInstance(${outputDto}, saved, { excludeExtraneousValues: true });
  }

  // Update
  async update(id: string, dto: ${updateDto}): Promise<${outputDto} | null> {
    await this.repo.update(id, dto);
    const updated = await this.repo.findOneBy({ id });
    return updated
      ? plainToInstance(${outputDto}, updated, { excludeExtraneousValues: true })
      : null;
  }

  // Delete
  async remove(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected !== 0;
  }
}
`;
}
