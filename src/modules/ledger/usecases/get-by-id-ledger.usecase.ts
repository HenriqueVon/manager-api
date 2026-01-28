import { inject, injectable } from 'tsyringe';
import { ILedgerRepository } from '../repositories/iledger.repository';
import { LEDGER_REPOSITORY } from '../repositories/ledger.tokens';
import { Ledger } from '@prisma/client';

@injectable()
export class GetByIdLedgerUseCase {
  constructor(
    @inject(LEDGER_REPOSITORY)
    private readonly ledgerRepository: ILedgerRepository
  ) {}

  async execute(id: string) : Promise<Ledger | null> {
    return this.ledgerRepository.findById(id);
  }
}
