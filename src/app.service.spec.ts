import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

import { AppService } from './app.service';
import { LoggerService } from './core/logger/logger.service';
import { CacheService } from './core/cache/cache.service';
import { DatabaseService } from './database/database.service';

describe('AppService', () => {
  let appService: AppService;
  let cacheService: DeepMocked<CacheService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: LoggerService, useValue: createMock<LoggerService>() },
        { provide: CacheService, useValue: createMock<CacheService>() },
        { provide: DatabaseService, useValue: createMock<DatabaseService>() },
      ],
    }).compile();

    appService = app.get<AppService>(AppService);
    cacheService = app.get(CacheService);
  });

  describe('root', () => {
    it('should return "Hello World!"', async () => {
      cacheService.get.mockResolvedValue('VALUE FROM CACHE');
      const result = await appService.getHello();
      expect(result).toBe('VALUE FROM CACHE');
    });
  });
});
