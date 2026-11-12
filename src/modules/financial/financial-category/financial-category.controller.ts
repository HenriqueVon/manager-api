import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { ListFinancialCategoryQueryDto } from './dtos';
import {
  CreateFinancialCategoryUseCase,
  UpdateFinancialCategoryUseCase,
  ListFinancialCategoryUseCase,
  GetByIdFinancialCategoryUseCase,
  DeleteFinancialCategoryUseCase
} from './usecases';

@injectable()
export class FinancialCategoryController {
  constructor(
    @inject(CreateFinancialCategoryUseCase)
    private readonly createFinancialCategoryUseCase: CreateFinancialCategoryUseCase,
    @inject(ListFinancialCategoryUseCase)
    private readonly listFinancialCategoryUseCase: ListFinancialCategoryUseCase,
    @inject(UpdateFinancialCategoryUseCase)
    private readonly updateFinancialCategoryUseCase: UpdateFinancialCategoryUseCase,
    @inject(GetByIdFinancialCategoryUseCase)
    private readonly getByIdFinancialCategoryUseCase: GetByIdFinancialCategoryUseCase,
    @inject(DeleteFinancialCategoryUseCase)
    private readonly deleteFinancialCategoryUseCase: DeleteFinancialCategoryUseCase
  ) {}

  async create(req: Request, res: Response) {
    const financialCategory = await this.createFinancialCategoryUseCase.execute(req.body);
    return res.status(201).json(financialCategory);
  }

  async list(req: Request, res: Response) {
    const { limit, offset, orderBy, orderDirection, ...filters } = req.query as unknown as ListFinancialCategoryQueryDto;
    const financialCategorys = await this.listFinancialCategoryUseCase.execute({ limit, offset, orderBy, orderDirection }, filters);
    
    return res.status(200).json(financialCategorys);
  }

  async getById(req: Request, res: Response) {
    const financialCategory = await this.getByIdFinancialCategoryUseCase.execute(req.params.id);
    return res.status(200).json(financialCategory);
  }

  async update(req: Request, res: Response) {
    const financialCategory = await this.updateFinancialCategoryUseCase.execute(req.params.id, req.body);
    return res.status(200).json(financialCategory);
  }

  async delete(req: Request, res: Response) {
    await this.deleteFinancialCategoryUseCase.execute(req.params.id);
    return res.status(204).send();
  }
}
