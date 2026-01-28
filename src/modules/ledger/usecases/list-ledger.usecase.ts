import { inject, injectable } from 'tsyringe';
import { Ledger } from '@prisma/client';
import { LedgerRepository } from '../repositories/ledger.repository';

@injectable()
export class ListLedgerUseCase {
  constructor(
    @inject(LedgerRepository)
    private readonly ledgerRepository : LedgerRepository
  ){}

  async execute() : Promise<Ledger[]> {
    const ledgers = await this.ledgerRepository.findMany();
    return ledgers;
  }
}