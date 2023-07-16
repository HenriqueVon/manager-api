import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyMessage } from 'src/entities/daily.message.entity';
import { DailyMessageController } from 'src/controllers/daily.message.controller';
import { DailyMessageService } from 'src/services/daily.message.service';
import { SubjectModule } from './subject.module';

@Module({
  imports: [TypeOrmModule.forFeature([DailyMessage]), SubjectModule],
  controllers: [DailyMessageController],
  providers: [DailyMessageService],
  exports: [DailyMessageService],
})
export class DailyMessageModule {}