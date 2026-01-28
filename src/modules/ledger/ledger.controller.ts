
import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe'
import {
  CreateLedgerUseCase,
  UpdateLedgerUseCase,
  ListLedgerUseCase,
  GetByIdLedgerUseCase,
  DeleteLedgerUseCase
} from './usecases/index';
import { UpdateLedgerDto } from './dtos';

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
    const { name, type } = req.body;

    try {
      const ledger = await this.createLedgerUseCase.execute({ name, type });
      return res.status(201).json(ledger);
    } catch {
      return res.status(400).json({ message: 'Bad Request'} )
    }
  }

  async list(req: Request, res: Response) {        
    try {
      const ledgers = await this.listLedgerUseCase.execute();
      return res.status(200).json(ledgers);
    } catch {
      return res.status(400).json({ message: 'Bad Request'})
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ledger = await this.getByIdLedgerUseCase.execute(id as string);
      return res.status(200).json(ledger);
    } catch {
      return res.status(400).json({ message: 'Bad Request'});
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data : UpdateLedgerDto = req.body;
      const ledger = await this.updateLedgerUseCase.execute(id as string, data);
      return res.status(200).json(ledger);
    } catch {
      return res.status(400).json({ message: 'Bad Request'} )
    }
  }

  async delete (req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.deleteLedgerUseCase.execute(id as string);
      return res.status(204).send();
    } catch {
      return res.status(400).json({ message: 'Bad Request'} );
    }
  }
}