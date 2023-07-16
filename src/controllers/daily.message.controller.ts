import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { DailyMessage, CreateDailyMessageDto, UpdateDailyMessageDto } from 'src/entities/daily.message.entity';
import { DailyMessageService } from 'src/services/daily.message.service';
import { SummaryMessages } from '../common/controllers/summary-messages';

const myEntity = DailyMessage.name.toLowerCase();
var pluralize = require('pluralize')

@ApiTags('Daily Messages')
@Controller('daily-messages')
export class DailyMessageController {
  constructor(private readonly dailyMessageService: DailyMessageService) {}

  @Get()
  @ApiOperation({summary: SummaryMessages.apiOperationGetAll(pluralize(myEntity))})
  @ApiOkResponse({ description: SummaryMessages.apiOkResponse})
  @ApiNotFoundResponse({ description: SummaryMessages.apiNotFoundResponse})  
  async findAll(): Promise<DailyMessage[]> {
    return await this.dailyMessageService.findAll();
  }

  @Get(':id')
  @ApiOperation({summary: SummaryMessages.apiOperationGetById(myEntity)}) 
  @ApiParam({
    name: 'id',
    required: true,
    description: SummaryMessages.apiParamIdUuId(myEntity),
    type: String,
    format: 'uuid',
  })   
  @ApiOkResponse({ description: SummaryMessages.apiOkResponse})
  @ApiNotFoundResponse({ description: SummaryMessages.apiNotFoundResponse})
  async findById(@Param('id') id: string): Promise<DailyMessage> {
    return await this.dailyMessageService.findById(id);
  }  

  @Get('subjects/:subject_id')
  @ApiOperation({summary: 'Gets all daily messages about one subject'})    
  @ApiOkResponse({ description: SummaryMessages.apiOkResponse})
  @ApiNotFoundResponse({ description: SummaryMessages.apiNotFoundResponse})  
  @ApiParam({
    name: 'subject_id',
    required: true,
    description: 'The UUID of the subject that exists in the database.',
    type: String,
    format: 'uuid',
  })     
  async findBySubjectId(@Param('subject_id') subjectId: string): Promise<DailyMessage[]> {
    return await this.dailyMessageService.findBySubjectId(subjectId);
  }
  
  @Post()  
  @ApiOperation({summary: SummaryMessages.apiOperationCreate(myEntity)})
  @ApiCreatedResponse({ description: SummaryMessages.apiCreatedResponse})
  @ApiBadRequestResponse({ description: SummaryMessages.apiBadRequestResponse})
  @ApiConflictResponse({description: SummaryMessages.apiConflictResponse(myEntity)})
  @ApiBody({type: CreateDailyMessageDto})
  async create(@Body() dailyMessage: CreateDailyMessageDto): Promise<DailyMessage> {
    try {      
      return await this.dailyMessageService.create(dailyMessage);      
    } catch (error) {
      throw error;
    }
  }
  
  @Put(':id')  
  @ApiOperation({summary: SummaryMessages.apiOperationUpdate(myEntity)}) 
  @ApiParam({
    name: 'id',
    required: true,
    description: SummaryMessages.apiParamIdUuId(myEntity),
    type: String,
    format: 'uuid',
  }) 
  @ApiOkResponse({ description: SummaryMessages.apiOkResponse})
  @ApiBadRequestResponse({ description: SummaryMessages.apiBadRequestResponse})
  @ApiNotFoundResponse({ description: SummaryMessages.apiNotFoundResponse})  
  @ApiBody({type: UpdateDailyMessageDto})
  async update(@Param('id') id: string, @Body() dailyMessage: UpdateDailyMessageDto): Promise<DailyMessage> {
    return await this.dailyMessageService.update(id, dailyMessage);
  }

  @Delete(':id')
  @ApiOperation({summary: SummaryMessages.apiOperationDelete(myEntity)})   
  @ApiParam({
    name: 'id',
    required: true,
    description: SummaryMessages.apiParamIdUuId(myEntity),
    type: String,
    format: 'uuid',
  })   
  @ApiNoContentResponse({ description: SummaryMessages.apiNoContentResponse})
  @ApiNotFoundResponse({ description: SummaryMessages.apiNotFoundResponse})      
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    return await this.dailyMessageService.delete(id);
  }
}