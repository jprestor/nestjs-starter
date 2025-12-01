import { Injectable } from '@nestjs/common';

import { LoggerService } from './core/logger/logger.service';
import { DatabaseService } from './database/database.service';
import { CacheService } from './core/cache/cache.service';

@Injectable()
export class AppService {
  private context = AppService.name;
  constructor(
    private readonly logger: LoggerService,
    private readonly cache: CacheService,
    private readonly databaseService: DatabaseService,
  ) {}

  async getHello() {
    this.logger.log('calling log from inside getHello method', this.context);
    const users = await this.databaseService.client.user.findMany();
    await this.cache.set('key', `VALUE FROM CACHE`, 1000);
    const valueFromCache = (await this.cache.get(`key`)) as string;

    return valueFromCache;
  }
}
