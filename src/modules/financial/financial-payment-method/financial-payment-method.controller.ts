import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import {
  CreateFinancialPaymentMethodUseCase,
  UpdateFinancialPaymentMethodUseCase,
  ListFinancialPaymentMethodUseCase,
  GetByIdFinancialPaymentMethodUseCase,
  DeleteFinancialPaymentMethodUseCase
} from './usecases';

@injectable()
export class FinancialPaymentMethodController {
  constructor(
    @inject(CreateFinancialPaymentMethodUseCase)
    private readonly createFinancialPaymentMethodUseCase: CreateFinancialPaymentMethodUseCase,
    @inject(ListFinancialPaymentMethodUseCase)
    private readonly listFinancialPaymentMethodUseCase: ListFinancialPaymentMethodUseCase,
    @inject(UpdateFinancialPaymentMethodUseCase)
    private readonly updateFinancialPaymentMethodUseCase: UpdateFinancialPaymentMethodUseCase,
    @inject(GetByIdFinancialPaymentMethodUseCase)
    private readonly getByIdFinancialPaymentMethodUseCase: GetByIdFinancialPaymentMethodUseCase,
    @inject(DeleteFinancialPaymentMethodUseCase)
    private readonly deleteFinancialPaymentMethodUseCase: DeleteFinancialPaymentMethodUseCase
  ) {}

  async create(req: Request, res: Response) {
    const financialPaymentMethod = await this.createFinancialPaymentMethodUseCase.execute(req.body);
    return res.status(201).json(financialPaymentMethod);
  }

  async list(req: Request, res: Response) {
    const financialPaymentMethods = await this.listFinancialPaymentMethodUseCase.execute({
      limit          : req.query.limit ? Number(req.query.limit) : undefined,
      offset         : req.query.offset ? Number(req.query.offset) : undefined,
      orderBy        : req.query.orderBy as string | undefined,
      orderDirection : req.query.orderDirection as 'asc' | 'desc' | undefined,
    });
    
    return res.status(200).json(financialPaymentMethods);
  }

  async getById(req: Request, res: Response) {
    const financialPaymentMethod = await this.getByIdFinancialPaymentMethodUseCase.execute(req.params.id);
    return res.status(200).json(financialPaymentMethod);
  }

  async update(req: Request, res: Response) {
    const financialPaymentMethod = await this.updateFinancialPaymentMethodUseCase.execute(req.params.id, req.body);
    return res.status(200).json(financialPaymentMethod);
  }

  async delete(req: Request, res: Response) {
    await this.deleteFinancialPaymentMethodUseCase.execute(req.params.id);
    return res.status(204).send();
  }
}
