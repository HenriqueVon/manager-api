import { inject, injectable } from 'tsyringe';
import { ILedgerRepository } from '../repositories/iledger.repository';
import { LEDGER_REPOSITORY } from '../repositories/ledger.tokens';
import { ResourcesInUseError, ResourcesNotFoundError } from '@shared/errors/app-error';
import { BulkDeleteDto } from '@shared/dtos/bulk-delete.dto';

@injectable()
export class BulkDeleteLedgerUseCase {
  constructor(
    @inject(LEDGER_REPOSITORY)
    private readonly ledgerRepository: ILedgerRepository
  ) {}

  // All or none, and the error lists the ids that stopped it: a missing id, or a record that other records use.
  async execute({ ids }: BulkDeleteDto): Promise<void> {
    const existing = new Set(await this.ledgerRepository.findExistingIds(ids));
    const missing = ids.filter((id) => !existing.has(id));

    if (missing.length > 0) {
      throw new ResourcesNotFoundError(missing);
    }

    // Another record uses it: the 409 lists them, and the user deletes the others
    const inUse = await this.ledgerRepository.findIdsInUse(ids);
    if (inUse.length > 0) {
      throw new ResourcesInUseError(inUse);
    }

    // A single DELETE statement, so it is atomic
    await this.ledgerRepository.deleteMany(ids);
  }
}
