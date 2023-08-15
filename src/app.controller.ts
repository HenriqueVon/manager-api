import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService
  ) {}
  
  @Get()
  get(): string {
    return this.configService.get('APP_NAME') + ' ' + this.configService.get('APP_VERSION');
  }
}
