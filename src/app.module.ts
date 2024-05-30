import { Module, Provider } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskService } from './task.service';
import { ScheduleModule } from '@nestjs/schedule';

import { v4 as uuidv4 } from 'uuid';
import { LockService } from './lock.service';



@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, TaskService
    , {
      provide: 'UUID',
      useFactory: () => uuidv4()}, LockService,
    
    ],
    
})
export class AppModule {}
