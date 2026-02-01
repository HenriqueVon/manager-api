import { container } from 'tsyringe';

import { LedgerRepository } from '../../modules/ledger/repositories/ledger.repository';
import { ILedgerRepository } from '../../modules/ledger/repositories/iledger.repository';
import { LEDGER_REPOSITORY } from '../../modules/ledger/repositories/ledger.tokens';
container.registerSingleton<ILedgerRepository>(LEDGER_REPOSITORY, LedgerRepository);