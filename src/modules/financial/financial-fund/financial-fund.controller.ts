import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import {
  CreateFinancialFundUseCase,
  UpdateFinancialFundUseCase,
  ListFinancialFundUseCase,
  GetByIdFinancialFundUseCase,
  DeleteFinancialFundUseCase
} from './usecases';

@injectable()
export class FinancialFundController {
  constructor(
    @inject(CreateFinancialFundUseCase)
    private readonly createFinancialFundUseCase: CreateFinancialFundUseCase,
    @inject(ListFinancialFundUseCase)
    private readonly listFinancialFundUseCase: ListFinancialFundUseCase,
    @inject(UpdateFinancialFundUseCase)
    private readonly updateFinancialFundUseCase: UpdateFinancialFundUseCase,
    @inject(GetByIdFinancialFundUseCase)
    private readonly getByIdFinancialFundUseCase: GetByIdFinancialFundUseCase,
    @inject(DeleteFinancialFundUseCase)
    private readonly deleteFinancialFundUseCase: DeleteFinancialFundUseCase
  ) {}

  async create(req: Request, res: Response) {
    const financialFund = await this.createFinancialFundUseCase.execute(req.body);
    return res.status(201).json(financialFund);
  }

  async list(req: Request, res: Response) {
    const financialFunds = await this.listFinancialFundUseCase.execute({
      limit          : req.query.limit ? Number(req.query.limit) : undefined,
      offset         : req.query.offset ? Number(req.query.offset) : undefined,
      orderBy        : req.query.orderBy as string | undefined,
      orderDirection : req.query.orderDirection as 'asc' | 'desc' | undefined,
    });
    
    return res.status(200).json(financialFunds);
  }

  async getById(req: Request, res: Response) {
    const financialFund = await this.getByIdFinancialFundUseCase.execute(req.params.id);
    return res.status(200).json(financialFund);
  }

  async update(req: Request, res: Response) {
    const financialFund = await this.updateFinancialFundUseCase.execute(req.params.id, req.body);
    return res.status(200).json(financialFund);
  }

  async delete(req: Request, res: Response) {
    await this.deleteFinancialFundUseCase.execute(req.params.id);
    return res.status(204).send();
  }
}
