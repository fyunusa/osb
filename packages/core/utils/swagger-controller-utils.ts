export function swaggerImports(useSwagger: boolean): string {
  return useSwagger
    ? `import { ApiOperation, ApiParam } from "@nestjs/swagger";\n`
    : "";
}

export function swaggerFindAll(useSwagger: boolean, lowerName: string): string {
  return useSwagger
    ? `  @ApiOperation({ summary: 'Get all ${lowerName}s' })\n`
    : "";
}

export function swaggerFindOne(useSwagger: boolean, lowerName: string): string {
  return useSwagger
    ? `  @ApiOperation({ summary: 'Get a single ${lowerName} by ID' })\n  @ApiParam({ name: 'id', required: true })\n`
    : "";
}

export function swaggerCreate(useSwagger: boolean, lowerName: string): string {
  return useSwagger
    ? `  @ApiOperation({ summary: 'Create a new ${lowerName}' })\n`
    : "";
}

export function swaggerUpdate(useSwagger: boolean, lowerName: string): string {
  return useSwagger
    ? `  @ApiOperation({ summary: 'Update an existing ${lowerName}' })\n  @ApiParam({ name: 'id', required: true })\n`
    : "";
}

export function swaggerRemove(useSwagger: boolean, lowerName: string): string {
  return useSwagger
    ? `  @ApiOperation({ summary: 'Delete a ${lowerName} by ID' })\n  @ApiParam({ name: 'id', required: true })\n`
    : "";
}
