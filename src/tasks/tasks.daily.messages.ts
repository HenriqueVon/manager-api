import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DailyMessageService } from 'src/services/daily.message.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TasksDailyMessage {
  constructor(        
    private dailyMessageService: DailyMessageService,    
    private configService: ConfigService,
  ) { }
    private readonly logger = new Logger(TasksDailyMessage.name);


  @Cron(CronExpression.EVERY_8_HOURS)
  async CronSendMessage() {
    await this.dailyMessageService.sendOneMessageToEmail(this.configService.get('EMAIL_TO_DAILY_MESSAGE'));        
  }
}