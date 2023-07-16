import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject, CreateSubjectDto, UpdateSubjectDto } from 'src/entities/subject.entity';
import { GenericRepository } from 'src/generic-repository/generic-repository';

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: GenericRepository<Subject>,
  ) {}

  async findAll(): Promise<Subject[]> {
    return await this.subjectRepository.find();
  }

  async findById(id: string): Promise<Subject> {
    try {
      const subject = await this.subjectRepository.findOneOrFail({
        where: { id },
      });
      return subject;
    } catch (error) {
      throw new NotFoundException('Subject not found');
    }
  }

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    const subject = new Subject();
    subject.name  = createSubjectDto.name;    
    return await this.subjectRepository.save(subject);      
  }

  async update(id: string, updateSubjectDTO: UpdateSubjectDto): Promise<Subject> {

    const subject =  await this.subjectRepository.findOneBy({ id });

    if (subject) {
      subject.name = updateSubjectDTO.name;    
      return await this.subjectRepository.save(subject);
    } else {
      throw new NotFoundException('Subject not found');
    }
  }
 
  async delete(id: string): Promise<void> {
    const result = await this.subjectRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Subject not found');
    }        
  }
}