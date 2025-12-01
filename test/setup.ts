import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import helmet from 'helmet';

import { AppModule } from './../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import { CacheService } from '../src/core/cache/cache.service';

let app: INestApplication<App>;
let server: App;
let databaseService: DatabaseService;
let cacheService: CacheService;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();

  app.use(helmet()); // security html headers
  app.useGlobalPipes(new ValidationPipe({ whitelist: true })); // global request body validation

  await app.init();
  server = app.getHttpServer();
  databaseService = app.get(DatabaseService);
  cacheService = app.get(CacheService);
});

afterEach(async () => {
  // reset database and cache after each test
  await databaseService.reset();
  await cacheService.reset();
});

afterAll(async () => {
  await app.close();
});

export { server };
