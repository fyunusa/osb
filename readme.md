---
# OSB Code Generator

A powerful and flexible code generation tool for building TypeScript backend applications with support for **DTOs**, **Entities**, **Controllers**, **Services**, and **Enums**. It also supports **Swagger decorators** and **TypeORM integration**.
---

## Features

- Generate **Entities** with TypeORM decorators
- Generate **DTOs** with class-validator and optional Swagger decorators
- Generate **Controllers** and **Services**
- Auto-generate **Enums** for enum-based fields
- Supports arrays, optional fields, and various types (`string`, `number`, `boolean`, `date`, `uuid`, `json`)
- Flexible command-line options for generating Swagger-ready and TypeORM-ready code

---

## Installation

```bash
yarn add osbts
# or
npm install osbts
```

---

## Usage

...

### 1. Generate all files for a model

```bash
yarn osb generate all User --modelPath ./src/modules/user
```

This generates:

- `UserEntity` in `entities/`
- `UserDTOs` (`InputDto`, `UpdateDto`, `OutputDto`) in `dtos/`
- `UserController` in `controllers/`
- `UserService` in `services/`
- `UserEnums` in `enums/` (if the model has enum fields)

---

### 2. Generate specific files

You can generate only the files you need by specifying the type:

- **Entity only:**

  ```bash
  yarn osb generate entity User --modelPath ./src/modules/user --use-swagger true
  ```

- **DTOs only:**

  ```bash
  yarn osb generate dto User --modelPath ./src/modules/user --use-swagger true
  ```

- **Controller only:**

  ```bash
  yarn osb generate controller User --modelPath ./src/modules/user
  ```

- **Service only:**

  ```bash
  yarn osb generate service User --modelPath ./src/modules/user
  ```

- **Enums only:**
  ```bash
  yarn osb generate enums User --modelPath ./src/modules/user
  ```

You can combine these options with `--use-swagger` and `--use-typeorm` flags as needed.

---

### 3. Generate files with Swagger decorators

```bash
yarn osb generate all User --modelPath ./src/modules/user --use-swagger true
```

- Adds `@ApiProperty()` decorators for Swagger/OpenAPI support
- Includes class-validator decorators (`@IsString()`, `@IsEnum()`, `@IsOptional()`, etc.)
- DTOs will now be Swagger-ready

---

### 4. Generate files with TypeORM integration

```bash
yarn osb generate all User --modelPath ./src/modules/user --use-swagger true --use-typeorm true
```

- Generates **TypeORM entities** with proper `@Column`, `@PrimaryGeneratedColumn`, `@CreateDateColumn`, and `@UpdateDateColumn` decorators
- Enum fields are automatically imported from the corresponding enum files
- Compatible with Swagger-enabled DTOs

---

## Supported Commands

You can use the following types with the `generate` command:

- `entity`
- `dto`
- `controller`
- `service`
- `enums`
- `all`

**Example:**

```bash
yarn osb generate <type> <ModelName> --modelPath <path> --use-swagger true --use-typeorm true
```

## Model Example

```ts
import { Model, Field, Validate } from "osbts/decorators";

export enum Roles {
  ADMIN = "admin",
  USER = "user",
  GUEST = "guest",
}

@Model({ name: "User" })
export class User {
  @Field({ primary: true, type: "uuid" })
  id!: string;

  @Field({ type: "string" })
  name!: string;

  @Validate({ rule: "required" })
  @Field({ type: "string" })
  email!: string;

  @Field({ type: "enum", enum: Roles, isArray: true })
  roles!: Roles[];
}
```

---

## Notes

- Enum fields are automatically mapped to `User<FieldName>Enum` in DTOs and Entities.
- Array enums are properly handled with `@IsArray()` and `@IsEnum(..., { each: true })`.
- Optional fields are marked with `?` and `@IsOptional()` decorators.
- Swagger integration requires the `--use-swagger true` flag.
- TypeORM integration requires the `--use-typeorm true` flag.

---

💬 Have questions or ideas?
Join the conversation in [GitHub Discussions](https://github.com/fyunusa/osb/discussions).

