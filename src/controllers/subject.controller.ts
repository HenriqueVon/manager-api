import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode  } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Subject, CreateSubjectDto, UpdateSubjectDto } from 'src/entities/subject.entity';
import { SubjectService } from 'src/services/subject.service';
import { SummaryMessages } from '../common/controllers/summary-messages';

const myEntity = Subject.name.toLowerCase();
var pluralize = require('pluralize')

@ApiTags('Subjects')
@Controller('subjects')
export class SubjectController {
  constructor(
    private readonly subjectService: SubjectService,    
  ) {}

  @Get()
  @ApiOperation({summary: SummaryMessages.apiOperationGetAll(pluralize(myEntity))})
  @ApiOkResponse({ description: SummaryMessages.apiOkResponse})
  @ApiNotFoundResponse({ description: SummaryMessages.apiNotFoundResponse})
  async findAll(): Promise<Subject[]> {    
    return await this.subjectService.findAll();    
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
  async findById(@Param('id') id: string): Promise<Subject> {    
    return await this.subjectService.findById(id);
  }

  @Post()
  @ApiOperation({summary: SummaryMessages.apiOperationCreate(myEntity)})
  @ApiCreatedResponse({ description: SummaryMessages.apiCreatedResponse})
  @ApiBadRequestResponse({ description: SummaryMessages.apiBadRequestResponse})
  @ApiConflictResponse({description: SummaryMessages.apiConflictResponse(myEntity)}) 
  @ApiBody({type: CreateSubjectDto})  
  async create(@Body() subject: CreateSubjectDto): Promise<Subject> {     
    return await this.subjectService.create(subject);      
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
  @ApiNotFoundResponse({ description: SummaryMessages.apiNotFoundResponse})  
  @ApiBadRequestResponse({ description: SummaryMessages.apiBadRequestResponse})
  @ApiConflictResponse({description: SummaryMessages.apiConflictResponse(myEntity)})
  @ApiBody({type: UpdateSubjectDto})  
  async update(@Param('id') id: string, @Body() subject: UpdateSubjectDto): Promise<Subject> {
    return await this.subjectService.update(id, subject);
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
    return await this.subjectService.delete(id);
  }
}