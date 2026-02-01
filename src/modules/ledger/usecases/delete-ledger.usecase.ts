import { inject, injectable } from 'tsyringe';
import { ILedgerRepository } from '../repositories/iledger.repository';
import { LEDGER_REPOSITORY } from '../repositories/ledger.tokens';

@injectable()
export class DeleteLedgerUseCase {
  constructor(
    @inject(LEDGER_REPOSITORY)
    private readonly ledgerRepository: ILedgerRepository
  ){}

  async execute(id: string) : Promise<void>{
    await this.ledgerRepository.delete(id);
  }
}