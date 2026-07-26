import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import {
  CreateFinancialBankAccountUseCase,
  UpdateFinancialBankAccountUseCase,
  ListFinancialBankAccountUseCase,
  GetByIdFinancialBankAccountUseCase,
  DeleteFinancialBankAccountUseCase
} from './usecases';

@injectable()
export class FinancialBankAccountController {
  constructor(
    @inject(CreateFinancialBankAccountUseCase)
    private readonly createFinancialBankAccountUseCase: CreateFinancialBankAccountUseCase,
    @inject(ListFinancialBankAccountUseCase)
    private readonly listFinancialBankAccountUseCase: ListFinancialBankAccountUseCase,
    @inject(UpdateFinancialBankAccountUseCase)
    private readonly updateFinancialBankAccountUseCase: UpdateFinancialBankAccountUseCase,
    @inject(GetByIdFinancialBankAccountUseCase)
    private readonly getByIdFinancialBankAccountUseCase: GetByIdFinancialBankAccountUseCase,
    @inject(DeleteFinancialBankAccountUseCase)
    private readonly deleteFinancialBankAccountUseCase: DeleteFinancialBankAccountUseCase
  ) {}

  async create(req: Request, res: Response) {
    const financialBankAccount = await this.createFinancialBankAccountUseCase.execute(req.body);
    return res.status(201).json(financialBankAccount);
  }

  async list(req: Request, res: Response) {
    const financialBankAccounts = await this.listFinancialBankAccountUseCase.execute({
      limit          : req.query.limit ? Number(req.query.limit) : undefined,
      offset         : req.query.offset ? Number(req.query.offset) : undefined,
      orderBy        : req.query.orderBy as string | undefined,
      orderDirection : req.query.orderDirection as 'asc' | 'desc' | undefined,
    });
    
    return res.status(200).json(financialBankAccounts);
  }

  async getById(req: Request, res: Response) {
    const financialBankAccount = await this.getByIdFinancialBankAccountUseCase.execute(req.params.id);
    return res.status(200).json(financialBankAccount);
  }

  async update(req: Request, res: Response) {
    const financialBankAccount = await this.updateFinancialBankAccountUseCase.execute(req.params.id, req.body);
    return res.status(200).json(financialBankAccount);
  }

  async delete(req: Request, res: Response) {
    await this.deleteFinancialBankAccountUseCase.execute(req.params.id);
    return res.status(204).send();
  }
}
