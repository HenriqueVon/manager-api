import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { ListFinancialDescriptionQueryDto } from './dtos';
import {
  CreateFinancialDescriptionUseCase,
  UpdateFinancialDescriptionUseCase,
  ListFinancialDescriptionUseCase,
  GetByIdFinancialDescriptionUseCase,
  DeleteFinancialDescriptionUseCase
} from './usecases';

@injectable()
export class FinancialDescriptionController {
  constructor(
    @inject(CreateFinancialDescriptionUseCase)
    private readonly createFinancialDescriptionUseCase: CreateFinancialDescriptionUseCase,
    @inject(ListFinancialDescriptionUseCase)
    private readonly listFinancialDescriptionUseCase: ListFinancialDescriptionUseCase,
    @inject(UpdateFinancialDescriptionUseCase)
    private readonly updateFinancialDescriptionUseCase: UpdateFinancialDescriptionUseCase,
    @inject(GetByIdFinancialDescriptionUseCase)
    private readonly getByIdFinancialDescriptionUseCase: GetByIdFinancialDescriptionUseCase,
    @inject(DeleteFinancialDescriptionUseCase)
    private readonly deleteFinancialDescriptionUseCase: DeleteFinancialDescriptionUseCase
  ) {}

  async create(req: Request, res: Response) {
    const financialDescription = await this.createFinancialDescriptionUseCase.execute(req.body);
    return res.status(201).json(financialDescription);
  }

  async list(req: Request, res: Response) {
    const { limit, offset, orderBy, orderDirection, ...filters } = req.query as unknown as ListFinancialDescriptionQueryDto;
    const financialDescriptions = await this.listFinancialDescriptionUseCase.execute({ limit, offset, orderBy, orderDirection }, filters);
    
    return res.status(200).json(financialDescriptions);
  }

  async getById(req: Request, res: Response) {
    const financialDescription = await this.getByIdFinancialDescriptionUseCase.execute(req.params.id);
    return res.status(200).json(financialDescription);
  }

  async update(req: Request, res: Response) {
    const financialDescription = await this.updateFinancialDescriptionUseCase.execute(req.params.id, req.body);
    return res.status(200).json(financialDescription);
  }

  async delete(req: Request, res: Response) {
    await this.deleteFinancialDescriptionUseCase.execute(req.params.id);
    return res.status(204).send();
  }
}
