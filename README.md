# Distributed Lock in NestJS

⚠️ **Warning:** : The make clean & run command will remove all stopped Docker containers. Ensure you do not have any important data in these containers before running this command.

## Overview

This repository demonstrates the use of a distributed lock mechanism in a NestJS application. The distributed lock ensures that only one instance of a scheduled task runs at any given time, even when multiple instances of the application are running. This is particularly useful in a distributed environment to prevent race conditions and ensure data consistency.

## Why Use a Distributed Lock?

In a microservices architecture or a distributed system, it's common to run multiple instances of an application for scalability and reliability. However, this can lead to situations where the same scheduled task is executed concurrently by different instances, causing conflicts or inconsistent data states. A distributed lock is used to ensure that a critical section of code is executed by only one instance at a time, thereby avoiding these issues.

## Implementation

The distributed lock is implemented using a Redis-based locking mechanism. Below is a brief explanation of the key components:

### LockService

`LockService` is responsible for acquiring and releasing locks. It interacts with Redis to set and delete keys that represent the lock.

```typescript
import { Inject, Injectable, Logger } from '@nestjs/common';
import { RedisClientType, createClient } from 'redis';

@Injectable()
export class LockService {
  private readonly logger = new Logger(LockService.name, { timestamp: true });
  private redisClient;
  constructor(@Inject('UUID') private readonly uuid: string) {}

  async onModuleInit() {
    this.redisClient = await createClient({
      url: 'redis://redis:6379',
    })
      .on('error', (err) => console.log('Redis Client Error', err))
      .connect();
  }

  async acquireLock(key: string, timeout = 10): Promise<boolean> {
    const end = Date.now() + timeout * 10;
    while (Date.now() < end) {
      const result = await this.redisClient.get(key);
      if (result === null) {
        const result = await this.redisClient.set(key, 'acquired', { EX: 5 });
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return false;
  }

  async releaseLock(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
```

## TaskService

TaskService is a scheduled task that runs every 10 seconds. It attempts to acquire a lock before executing the task. If it successfully acquires the lock, it performs the task and then releases the lock. If it fails to acquire the lock, it logs an error message.
The sleep function is to simulated doing some work.

```typescript
iimport { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LockService } from './lock.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name,{timestamp:true});

    constructor(
      @Inject('UUID') private readonly uuid: string,
      private readonly lockService: LockService) {}


  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    const lockKey = 'my_lock';
    if (await this.lockService.acquireLock(lockKey)) {
      try {
        const nowWithMillis = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        this.logger.log(`Cron  ${this.uuid} is executing  at ${nowWithMillis}`);

        await sleep(1800);

      } finally {

        await this.lockService.releaseLock(lockKey);
        const nowWithMillis = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        this.logger.log(`Cron ${this.uuid} released lock  at ${nowWithMillis}`);
      }
    } else {
      const nowWithMillis = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
      this.logger.error(`Cron ${this.uuid} failed to acquire lock  at ${nowWithMillis}`);
    }

  }




}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```
