import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DailyMessage, CreateDailyMessageDto, UpdateDailyMessageDto } from 'src/entities/daily.message.entity';
import { GenericRepository } from 'src/generic-repository/generic-repository';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DailyMessageService {
  constructor(
    @InjectRepository(DailyMessage)
    private readonly dailyMessageRepository: GenericRepository<DailyMessage>,
    private configService: ConfigService
  ) {}

  async findAll(): Promise<DailyMessage[]> {
    return await this.dailyMessageRepository.find(
      { relations: ["subject"]}
    );
  }

  async findById(id: string): Promise<DailyMessage> {
    try {
      const dailyMessage = await this.dailyMessageRepository.findOneOrFail({
        relations: ["subject"],
        where: { id },
      });
      return dailyMessage;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async findBySubjectId(subjectId: string): Promise<DailyMessage[]> {
    const dailyMessages = await this.dailyMessageRepository.find({            
        where: { subject: { id: subjectId } },
      });
      
      if (dailyMessages.length > 0) {
        return dailyMessages;
      } else{
        throw new NotFoundException();
      }
  }

  async create(createDailyMessageDto: CreateDailyMessageDto): Promise<DailyMessage> {
    const dailyMessage    = new DailyMessage();
    dailyMessage.message  = createDailyMessageDto.message;  
    dailyMessage.subject  = createDailyMessageDto.subject;  
    return await this.dailyMessageRepository.save(dailyMessage);      
  }

  async update(id: string, updateDailyMessageDto: UpdateDailyMessageDto): Promise<DailyMessage> {

    const dailyMessage =  await this.dailyMessageRepository.findOneBy({ id });

    if (dailyMessage) {
      dailyMessage.message = updateDailyMessageDto.message;    
      return await this.dailyMessageRepository.save(dailyMessage);
    } else {
      throw new NotFoundException();
    }
  }
 
  async delete(id: string): Promise<void> {
    const result = await this.dailyMessageRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException();
    }        
  }

  async findOneRandom(): Promise<DailyMessage> {
    const dailyMessage = await this.dailyMessageRepository.createQueryBuilder('daily-messages')
      .select()
      .orderBy('RANDOM()')
      .getOne();

    return dailyMessage;
  }

  async sendOneMessageToEmail(email: string) {
    try {
      const dailyMessage = await this.findOneRandom();

      if (!dailyMessage) {
        throw new NotFoundException();
      }

      const emailservice = new EmailService(this.configService)
      emailservice.sendEmail(email, "Daily Message", dailyMessage.message);
    } catch (error) {            
      if (error instanceof NotFoundException) {        
        throw new NotFoundException("No daily message found to send.");
      }
      throw new InternalServerErrorException();
    }
  }

}