import { inject, injectable } from 'tsyringe';
import { Ledger } from '@prisma/client';
import { ILedgerRepository } from './../repositories/iledger.repository';
import { LEDGER_REPOSITORY } from '../repositories/ledger.tokens';
import { CreateLedgerDto } from '../dtos';
import { ConflictError } from './../../../shared/errors/app-error';

@injectable()
export class CreateLedgerUseCase {
  constructor(
    @inject(LEDGER_REPOSITORY)
    private readonly ledgerRepository : ILedgerRepository
  ){}
  
  async execute(input: CreateLedgerDto) : Promise<Ledger> {
    const name = input.name.trim().toUpperCase();
    
    const existing = await this.ledgerRepository.findByName(name);
    if (existing) {
      throw new ConflictError('Ledger name already exists!')
    }
    
    return this.ledgerRepository.create({ 
      ...input,
      name
    });
  }
}