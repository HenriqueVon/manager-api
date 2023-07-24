import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DailyMessageService } from 'src/services/daily.message.service';

@Injectable()
export class TasksDailyMessage {
  constructor(        
    private dailyMessageService: DailyMessageService,    
  ) { }
    private readonly logger = new Logger(TasksDailyMessage.name);

  // When start the module
  onModuleInit() {
    console.log('Start cron GetOneMessage! onModuleInit');
  }

  @Cron('*/5 * * * * *') // Every 5 seconds
  async GetOneMessage() {
    console.log('Every 5 seconds! Fcuntion GetOneMessage');
    // ...
  }
}