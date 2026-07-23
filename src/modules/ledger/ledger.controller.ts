
import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe'
import {
  CreateLedgerUseCase,
  UpdateLedgerUseCase,
  ListLedgerUseCase,
  GetByIdLedgerUseCase,
  DeleteLedgerUseCase
} from './usecases/index';

@injectable()
export class LedgerController{
  constructor(
    @inject(CreateLedgerUseCase)
    private readonly createLedgerUseCase : CreateLedgerUseCase,
    @inject(ListLedgerUseCase)
    private readonly listLedgerUseCase : ListLedgerUseCase,
    @inject(UpdateLedgerUseCase)
    private readonly updateLedgerUseCase : UpdateLedgerUseCase,
    @inject(GetByIdLedgerUseCase)
    private readonly getByIdLedgerUseCase : GetByIdLedgerUseCase,
    @inject (DeleteLedgerUseCase)
    private readonly deleteLedgerUseCase : DeleteLedgerUseCase
  ){}

  async create(req: Request, res: Response) {        
    const ledger = await this.createLedgerUseCase.execute(req.body);
    return res.status(201).json(ledger);
  }

  async list(req: Request, res: Response) {
    const ledgers = await this.listLedgerUseCase.execute({
      limit          : req.query.limit ? Number(req.query.limit) : undefined,
      offset         : req.query.offset ? Number(req.query.offset) : undefined,
      orderBy        : req.query.orderBy as string | undefined,
      orderDirection : req.query.orderDirection as 'asc' | 'desc' | undefined,
    });
    
    return res.status(200).json(ledgers);
  }

  async getById(req: Request, res: Response) {    
    const ledger = await this.getByIdLedgerUseCase.execute(req.params.id);
    return res.status(200).json(ledger);
  }

  async update(req: Request, res: Response) {    
    const ledger = await this.updateLedgerUseCase.execute(req.params.id, req.body);
    return res.status(200).json(ledger);
  }

  async delete (req: Request, res: Response) {    
    await this.deleteLedgerUseCase.execute(req.params.id);
    return res.status(204).send();
  }
}