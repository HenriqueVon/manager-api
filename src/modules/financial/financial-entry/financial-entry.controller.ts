import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import {
  CreateFinancialEntryUseCase,
  UpdateFinancialEntryUseCase,
  ListFinancialEntryUseCase,
  GetByIdFinancialEntryUseCase,
  DeleteFinancialEntryUseCase
} from './usecases';

@injectable()
export class FinancialEntryController {
  constructor(
    @inject(CreateFinancialEntryUseCase)
    private readonly createFinancialEntryUseCase: CreateFinancialEntryUseCase,
    @inject(ListFinancialEntryUseCase)
    private readonly listFinancialEntryUseCase: ListFinancialEntryUseCase,
    @inject(UpdateFinancialEntryUseCase)
    private readonly updateFinancialEntryUseCase: UpdateFinancialEntryUseCase,
    @inject(GetByIdFinancialEntryUseCase)
    private readonly getByIdFinancialEntryUseCase: GetByIdFinancialEntryUseCase,
    @inject(DeleteFinancialEntryUseCase)
    private readonly deleteFinancialEntryUseCase: DeleteFinancialEntryUseCase
  ) {}

  async create(req: Request, res: Response) {
    const financialEntry = await this.createFinancialEntryUseCase.execute(req.body);
    return res.status(201).json(financialEntry);
  }

  async list(req: Request, res: Response) {
    const financialEntrys = await this.listFinancialEntryUseCase.execute({
      limit          : req.query.limit ? Number(req.query.limit) : undefined,
      offset         : req.query.offset ? Number(req.query.offset) : undefined,
      orderBy        : req.query.orderBy as string | undefined,
      orderDirection : req.query.orderDirection as 'asc' | 'desc' | undefined,
    });
    
    return res.status(200).json(financialEntrys);
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
}
