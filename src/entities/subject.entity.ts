import { ApiProperty, PickType } from '@nestjs/swagger';
import { Entity, Column, PrimaryColumn } from 'typeorm';
import { IsNotEmpty, IsUUID, Matches } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';

@Entity({ name : "subjects" })
export class Subject {
  @ApiProperty({
    example: "e1e7ddef-bee5-4781-a52a-c95158990778",
    description: 'The unique identifier of the subject.',
    required: true,
    readOnly: true
  })    
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @ApiProperty({
    example: '',
    description: 'The name of the subject.',
    required: true,
  })
  @Column({ nullable: false, unique: true })
  @IsNotEmpty()
  @Matches(/^(?!\s*$).+/)
  name: string;
}

export class CreateSubjectDto extends PickType(Subject, ['name']) {}
export class UpdateSubjectDto extends PickType(Subject, ['name']) {}