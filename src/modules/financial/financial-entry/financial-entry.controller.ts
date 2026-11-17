import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { ListFinancialEntryQueryDto, SummaryFinancialEntryQueryDto } from './dtos';
import {
  CreateFinancialEntryUseCase,
  CreateFinancialEntryInstallmentsUseCase,
  UpdateFinancialEntryUseCase,
  ListFinancialEntryUseCase,
  GetByIdFinancialEntryUseCase,
  DeleteFinancialEntryUseCase,
  BulkDeleteFinancialEntryUseCase,
  SummaryFinancialEntryUseCase
} from './usecases';

@injectable()
export class FinancialEntryController {
  constructor(
    @inject(CreateFinancialEntryUseCase)
    private readonly createFinancialEntryUseCase: CreateFinancialEntryUseCase,
    @inject(CreateFinancialEntryInstallmentsUseCase)
    private readonly createFinancialEntryInstallmentsUseCase: CreateFinancialEntryInstallmentsUseCase,
    @inject(ListFinancialEntryUseCase)
    private readonly listFinancialEntryUseCase: ListFinancialEntryUseCase,
    @inject(UpdateFinancialEntryUseCase)
    private readonly updateFinancialEntryUseCase: UpdateFinancialEntryUseCase,
    @inject(GetByIdFinancialEntryUseCase)
    private readonly getByIdFinancialEntryUseCase: GetByIdFinancialEntryUseCase,
    @inject(DeleteFinancialEntryUseCase)
    private readonly deleteFinancialEntryUseCase: DeleteFinancialEntryUseCase,
    @inject(BulkDeleteFinancialEntryUseCase)
    private readonly bulkDeleteFinancialEntryUseCase: BulkDeleteFinancialEntryUseCase,
    @inject(SummaryFinancialEntryUseCase)
    private readonly summaryFinancialEntryUseCase: SummaryFinancialEntryUseCase
  ) {}

  async create(req: Request, res: Response) {
    const financialEntry = await this.createFinancialEntryUseCase.execute(req.body);
    return res.status(201).json(financialEntry);
  }

  async createInstallments(req: Request, res: Response) {
    const financialEntries = await this.createFinancialEntryInstallmentsUseCase.execute(req.body);
    return res.status(201).json(financialEntries);
  }

  async list(req: Request, res: Response) {
    const { limit, offset, orderBy, orderDirection, ...filters } = req.query as unknown as ListFinancialEntryQueryDto;
    const financialEntrys = await this.listFinancialEntryUseCase.execute({ limit, offset, orderBy, orderDirection }, filters);

    return res.status(200).json(financialEntrys);
  }

  async summary(req: Request, res: Response) {
    const summary = await this.summaryFinancialEntryUseCase.execute(req.query as unknown as SummaryFinancialEntryQueryDto);
    return res.status(200).json(summary);
  }

  async getById(req: Request, res: Response) {
    const financialEntry = await this.getByIdFinancialEntryUseCase.execute(req.params.id);
    return res.status(200).json(financialEntry);
  }

  async update(req: Request, res: Response) {
    const financialEntry = await this.updateFinancialEntryUseCase.execute(req.params.id, req.body);
    return res.status(200).json(financialEntry);
  }

  async delete(req: Request, res: Response) {
    await this.deleteFinancialEntryUseCase.execute(req.params.id);
    return res.status(204).send();
  }

  async bulkDelete(req: Request, res: Response) {
    await this.bulkDeleteFinancialEntryUseCase.execute(req.body);
    return res.status(204).send();
  }
}
