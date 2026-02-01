import { inject, injectable } from 'tsyringe';
import { UpdateLedgerDto } from '../dtos';
import { ILedgerRepository } from '../repositories/iledger.repository';
import { LEDGER_REPOSITORY } from '../repositories/ledger.tokens';
import { Ledger } from '@prisma/client';

@injectable()
export class UpdateLedgerUseCase {
  constructor(
    @inject(LEDGER_REPOSITORY)
    private readonly ledgerRepository : ILedgerRepository
  ){}

  async execute(id: string, input: UpdateLedgerDto) : Promise<Ledger> {
    return await this.ledgerRepository.update(id, input);
  }
}