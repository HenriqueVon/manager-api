import { inject, injectable } from 'tsyringe';
import { Ledger } from '@prisma/client';
import { ILedgerRepository } from './../repositories/iledger.repository';
import { LEDGER_REPOSITORY } from '../repositories/ledger.tokens';
import { CreateLedgerDto } from '../dtos';

@injectable()
export class CreateLedgerUseCase {
  constructor(
    @inject(LEDGER_REPOSITORY)
    private readonly ledgerRepository : ILedgerRepository
  ){}
  
  async execute(input: CreateLedgerDto) : Promise<Ledger> {
    return await this.ledgerRepository.create(input);
  }
}