# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context7 MCP

Always use context7 when I need code generation, setup or configuration steps, or library/API documentation. This means you should automatically use the Context7 MCP tools to resolve library id and get library docs without me having to explicitly ask.

## Common Commands

### Development

- `npm run start:dev` - Start development server with watch mode (also starts Docker containers)
- `npm run build` - Build the project
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier

### Testing

- `npm run test` - Run unit tests
- `npm run test:watch` - Run unit tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:e2e` - Run e2e tests (spins up test containers, runs tests, then tears down)
- Run a single test file: `npm run test -- path/to/file.spec.ts`
- Debug a test: `npm run test:debug -- path/to/file.spec.ts`

### Database & Prisma

- `npm run db:migrate:dev` - Run migrations in development
- `npm run db:migrate:prod` - Deploy migrations to production
- `npm run db:studio` - Open Prisma Studio
- Prisma schema location: `src/database/schema.prisma`
- Generated client output: `generated/prisma/client`

### Docker

- `npm run docker:start` - Start development Postgres (port 5434) and Redis (port 6380)
- `npm run docker:start:test` - Start test containers (Postgres on 5435, Redis on 6381)
- `npm run docker:down:test` - Stop test containers

## Architecture Overview

### Module Structure

The application follows a modular NestJS architecture with a global CoreModule that provides shared services:

- **CoreModule** (`src/core/core.module.ts`) - Global module providing:
  - Custom LoggerService (Winston-based)
  - CacheService (Redis-backed via cache-manager)
  - TransformResponseInterceptor (wraps all responses in `{ data: ... }` format)
  - LoggerMiddleware (request/response logging on all routes)
  - ConfigModule (globally available environment configuration)

- **DatabaseModule** (`src/database/database.module.ts`) - Global module providing:
  - DatabaseService extending PrismaClient
  - Automatic connection lifecycle management (connects on init, disconnects on destroy)

- **AppModule** (`src/app.module.ts`) - Root module importing CoreModule

### Key Services

**DatabaseService** (`src/database/database.service.ts`)

- Extends PrismaClient directly
- Injected globally, use it for all database operations
- Example: `this.databaseService.user.findMany()`

**LoggerService** (`src/core/logger/logger.service.ts`)

- Winston-based logger configured in main.ts
- Used for all application logging

**CacheService** (`src/core/cache/cache.service.ts`)

- Wraps @nestjs/cache-manager with Redis backend
- Configuration in CoreModule uses environment variables

### Global Configuration

**main.ts** sets up:

- Custom LoggerService
- Helmet security headers
- Global ValidationPipe with whitelist enabled

**Config** (`src/config/index.ts`)

- Exposes environment variables via ConfigService
- Currently configured: environment, redis settings

### Testing Setup

**Unit Tests:**

- Jest configuration in package.json
- Root directory: `src`
- Pattern: `*.spec.ts`
- Runs with `NODE_OPTIONS="--experimental-vm-modules"` for Prisma v7 WASM support

**E2E Tests:**

- Configuration: `test/jest-e2e.json`
- Pattern: `.e2e-spec.ts` or `.int-spec.ts`
- Uses separate Docker containers (see docker-compose-test.yml)
- Runs with `NODE_OPTIONS="--experimental-vm-modules"` for Prisma v7 WASM support

**Prisma v7 + Jest Configuration:**

- Prisma v7 uses dynamic imports for WASM modules, requiring `--experimental-vm-modules` flag
- `moduleNameMapper` in Jest config resolves `.js` imports to TypeScript files: `"^(\\.{1,2}/.*)\\.js$": "$1"`
- `isolatedModules: true` in tsconfig.json for faster ts-jest transformation
- All test commands (`npm test`, `npm run test:e2e`, etc.) automatically include the required Node.js flags

### Environment Setup

Required environment variables (see `.env.example`):

- NODE_ENV
- POSTGRES_USER, POSTGRES_PASSWORD
- DATABASE_URL (format: postgresql://user:password@localhost:port/dbname?schema=public)
- REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD

Separate `.env.test` for e2e test environment.

### Response Transformation

All controller responses are automatically wrapped by TransformResponseInterceptor:

- Simple data: `{ data: responseData }`
- Paginated data with meta: `{ data: [...], meta: {...} }`
- Empty/null: `{ data: [] }`

When creating new endpoints, return plain objects or arrays - the interceptor handles wrapping.

### Prisma Client Generation (v7)

**Configuration:**

- Generator: `prisma-client` (new in v7)
- Module format: `cjs` (CommonJS)
- Custom output directory: `generated/prisma`
- Runs automatically on `npm install` via postinstall script

**Usage:**

- Import in code: `import { PrismaClient } from '../../generated/prisma/client'`
- After schema changes: run `npm run db:migrate:dev` to regenerate client

**Important Notes for Prisma v7:**

- Generated client uses `.js` extensions in imports (TypeScript ESM standard)
- Uses dynamic imports for WASM query compiler modules
- Requires `--experimental-vm-modules` flag when running tests with Jest
- Jest `moduleNameMapper` configured to resolve `.js` imports to `.ts` files
