import { Module } from '@nestjs/common';
import { TasksDailyMessage } from './tasks.daily.messages';
import { DailyMessageModule } from 'src/modules/daily-message.module';

@Module(
  {    
    imports: [DailyMessageModule],
    providers: [ TasksDailyMessage ],
})
export class TasksModule {}