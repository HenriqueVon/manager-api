import { inject, injectable } from 'tsyringe';
import { UpdateLedgerDto } from '../dtos';
import { ILedgerRepository } from '../repositories/iledger.repository';
import { LEDGER_REPOSITORY } from '../repositories/ledger.tokens';
import { Ledger } from '@prisma/client';
import { ConflictError } from '../../../shared/errors/app-error';

@injectable()
export class UpdateLedgerUseCase {
  constructor(
    @inject(LEDGER_REPOSITORY)
    private readonly ledgerRepository : ILedgerRepository
  ){}

  async execute(id: string, input: UpdateLedgerDto) : Promise<Ledger> {
    const data: UpdateLedgerDto = {...input};

    if (input.name !== undefined) {
      const name = input.name.trim().toUpperCase();
      const existing = await this.ledgerRepository.findByName(name);

      if (existing && existing.id !== id) {
        throw new ConflictError('Ledger name already exists!')
      }

      data.name = name;
    }
  
    return await this.ledgerRepository.update(id, data );
  }
}