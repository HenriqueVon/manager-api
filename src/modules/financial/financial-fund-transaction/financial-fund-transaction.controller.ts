import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import {
  CreateFinancialFundTransactionUseCase,
  UpdateFinancialFundTransactionUseCase,
  ListFinancialFundTransactionUseCase,
  GetByIdFinancialFundTransactionUseCase,
  DeleteFinancialFundTransactionUseCase
} from './usecases';

@injectable()
export class FinancialFundTransactionController {
  constructor(
    @inject(CreateFinancialFundTransactionUseCase)
    private readonly createFinancialFundTransactionUseCase: CreateFinancialFundTransactionUseCase,
    @inject(ListFinancialFundTransactionUseCase)
    private readonly listFinancialFundTransactionUseCase: ListFinancialFundTransactionUseCase,
    @inject(UpdateFinancialFundTransactionUseCase)
    private readonly updateFinancialFundTransactionUseCase: UpdateFinancialFundTransactionUseCase,
    @inject(GetByIdFinancialFundTransactionUseCase)
    private readonly getByIdFinancialFundTransactionUseCase: GetByIdFinancialFundTransactionUseCase,
    @inject(DeleteFinancialFundTransactionUseCase)
    private readonly deleteFinancialFundTransactionUseCase: DeleteFinancialFundTransactionUseCase
  ) {}

  async create(req: Request, res: Response) {
    const financialFundTransaction = await this.createFinancialFundTransactionUseCase.execute(req.body);
    return res.status(201).json(financialFundTransaction);
  }

  async list(req: Request, res: Response) {
    const financialFundTransactions = await this.listFinancialFundTransactionUseCase.execute({
      limit          : req.query.limit ? Number(req.query.limit) : undefined,
      offset         : req.query.offset ? Number(req.query.offset) : undefined,
      orderBy        : req.query.orderBy as string | undefined,
      orderDirection : req.query.orderDirection as 'asc' | 'desc' | undefined,
    });
    
    console.log('FinancialFundTransactionController.list called with query:', req.query);

    return res.status(200).json(financialFundTransactions);
  }

  async getById(req: Request, res: Response) {
    const financialFundTransaction = await this.getByIdFinancialFundTransactionUseCase.execute(req.params.id);
    return res.status(200).json(financialFundTransaction);
  }

  async update(req: Request, res: Response) {
    const financialFundTransaction = await this.updateFinancialFundTransactionUseCase.execute(req.params.id, req.body);
    return res.status(200).json(financialFundTransaction);
  }

  async delete(req: Request, res: Response) {
    await this.deleteFinancialFundTransactionUseCase.execute(req.params.id);
    return res.status(204).send();
  }
}
