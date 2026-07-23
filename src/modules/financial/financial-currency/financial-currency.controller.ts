import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import {
  CreateFinancialCurrencyUseCase,
  UpdateFinancialCurrencyUseCase,
  ListFinancialCurrencyUseCase,
  GetByIdFinancialCurrencyUseCase,
  DeleteFinancialCurrencyUseCase
} from './usecases';

@injectable()
export class FinancialCurrencyController {
  constructor(
    @inject(CreateFinancialCurrencyUseCase)
    private readonly createFinancialCurrencyUseCase: CreateFinancialCurrencyUseCase,
    @inject(ListFinancialCurrencyUseCase)
    private readonly listFinancialCurrencyUseCase: ListFinancialCurrencyUseCase,
    @inject(UpdateFinancialCurrencyUseCase)
    private readonly updateFinancialCurrencyUseCase: UpdateFinancialCurrencyUseCase,
    @inject(GetByIdFinancialCurrencyUseCase)
    private readonly getByIdFinancialCurrencyUseCase: GetByIdFinancialCurrencyUseCase,
    @inject(DeleteFinancialCurrencyUseCase)
    private readonly deleteFinancialCurrencyUseCase: DeleteFinancialCurrencyUseCase
  ) {}

  async create(req: Request, res: Response) {
    const financialCurrency = await this.createFinancialCurrencyUseCase.execute(req.body);
    return res.status(201).json(financialCurrency);
  }

  async list(req: Request, res: Response) {
    const financialCurrencys = await this.listFinancialCurrencyUseCase.execute({
      limit          : req.query.limit ? Number(req.query.limit) : undefined,
      offset         : req.query.offset ? Number(req.query.offset) : undefined,
      orderBy        : req.query.orderBy as string | undefined,
      orderDirection : req.query.orderDirection as 'asc' | 'desc' | undefined,
    });
    
    return res.status(200).json(financialCurrencys);
  }

  async getById(req: Request, res: Response) {
    const financialCurrency = await this.getByIdFinancialCurrencyUseCase.execute(req.params.id);
    return res.status(200).json(financialCurrency);
  }

  async update(req: Request, res: Response) {
    const financialCurrency = await this.updateFinancialCurrencyUseCase.execute(req.params.id, req.body);
    return res.status(200).json(financialCurrency);
  }

  async delete(req: Request, res: Response) {
    await this.deleteFinancialCurrencyUseCase.execute(req.params.id);
    return res.status(204).send();
  }
}
