import { Inject, Injectable, Logger } from '@nestjs/common';
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
        //this.logger.log(`After locking  ${this.uuid} at ${nowWithMillis}`);

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