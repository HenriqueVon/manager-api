import { ApiProperty, PickType } from '@nestjs/swagger';
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { IsNotEmpty, IsUUID, Matches } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { Subject } from './subject.entity';

@Entity({ name : "daily-messages" })
export class DailyMessage {
  @ApiProperty({
    example: "e1e7ddef-bee5-4781-a52a-c95158990778",
    description: 'The unique identifier of the daily message.',
    required: true,
    readOnly: true
  })    
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @ApiProperty({
    example: '',
    description: 'The message.',
    required: true,
  })
  @Column({ nullable: false, unique: true })
  @IsNotEmpty()
  @Matches(/^(?!\s*$).+/)
  message: string;

  @ApiProperty({   
    example: "", 
    description: 'Id of subject',
    required: true,
  })
  @ManyToOne(() => Subject, {
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })   
  @JoinColumn({ name: 'subject_id' })
  @Index()
  @IsNotEmpty()
  @IsUUID()
  subject: Subject;  
}

export class CreateDailyMessageDto extends PickType(DailyMessage, ['message', 'subject']) {}
export class UpdateDailyMessageDto extends PickType(DailyMessage, ['message']) {}