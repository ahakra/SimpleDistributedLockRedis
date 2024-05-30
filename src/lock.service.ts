import { Inject, Injectable, Logger } from '@nestjs/common';
import { RedisClientType, createClient } from 'redis';

@Injectable()
export class LockService {
    private readonly logger = new Logger(LockService.name,{timestamp:true});
    private redisClient;
  constructor(
    @Inject('UUID') private readonly uuid: string,

  ) {
    
  }

  async onModuleInit() {
    this.redisClient = await createClient({
        url: 'redis://redis:6379'
    })
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

  }


  async acquireLock(key: string, timeout = 10): Promise<boolean> {
  
    const end = Date.now() + timeout * 10; 
    while (Date.now() < end) {
      const result = await this.redisClient.get(key);
      if (result === null) {
        const result = await this.redisClient.set(key,"acquired", {EX: 5});
        return true; 
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
   
    return false; 
  }

  async releaseLock(key: string): Promise<void> {    
    await this.redisClient.del(key); 
  }
}
