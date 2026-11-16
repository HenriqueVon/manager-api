import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { ListFinancialFundTransactionQueryDto } from './dtos';
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
    const { limit, offset, orderBy, orderDirection, ...filters } = req.query as unknown as ListFinancialFundTransactionQueryDto;
    const financialFundTransactions = await this.listFinancialFundTransactionUseCase.execute({ limit, offset, orderBy, orderDirection }, filters);

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
