import { inject, injectable } from 'tsyringe';
import { Ledger } from '@prisma/client';
import { ILedgerRepository } from '../repositories/iledger.repository';
import { LEDGER_REPOSITORY } from '../repositories/ledger.tokens';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto'; 

@injectable()
export class ListLedgerUseCase {
  constructor(
    @inject(LEDGER_REPOSITORY)
    private readonly ledgerRepository: ILedgerRepository
  ) {}

  async execute(params: ListParamsDto): Promise<PaginatedResponseDto<Ledger>> {
    return this.ledgerRepository.findMany({}, params);
  }

}