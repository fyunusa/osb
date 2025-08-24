// core/generators/service.ts
export function generateService(model: Function): string {
  const modelName = model.name;
  const entityName = `${modelName}Entity`;
  const inputDto = `${modelName}InputDto`;
  const updateDto = `${modelName}UpdateDto`;
  const outputDto = `${modelName}OutputDto`;

  return `
  import { ${entityName} } from "../entities/${modelName}.entity";
import { ${outputDto} } from "../dtos/${modelName}.outputDto";
import { ${inputDto} } from "../dtos/${modelName}.inputDto";
import { ${updateDto} } from "../dtos/${modelName}.updateDto";

export class ${modelName}Service {
  private data: ${entityName}[] = [];

  // Find all records
  async findAll(): Promise<${outputDto}[]> {
    return this.data.map(item => this.toOutputDto(item));
  }

  // Find one by ID
  async findOne(id: string): Promise<${outputDto} | undefined> {
    const entity = this.data.find(item => item.id === id);
    return entity ? this.toOutputDto(entity) : undefined;
  }

  // Create a new record
  async create(input: ${inputDto}): Promise<${outputDto}> {
    const new${modelName} = { ...input, id: this.generateId() } as ${entityName};
    this.data.push(new${modelName});
    return this.toOutputDto(new${modelName});
  }

  // Update an existing record
  async update(id: string, input: ${updateDto}): Promise<${outputDto} | undefined> {
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) return undefined;
    this.data[index] = { ...this.data[index], ...input };
    return this.toOutputDto(this.data[index]);
  }

  // Delete a record
  async remove(id: string): Promise<boolean> {
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) return false;
    this.data.splice(index, 1);
    return true;
  }

  // Helper: map Entity → OutputDto
  private toOutputDto(entity: ${entityName}): ${outputDto} {
    return { ...entity }; // simple mapping, extend if needed
  }

  // Helper: generate UUID
  private generateId(): string {
    return crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9);
  }
}
`;
}
