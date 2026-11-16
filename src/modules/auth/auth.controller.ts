import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { EndUser } from '@services/auth/auth.service';
import {
  ExchangeCodeUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  LogoutAllUseCase
} from './usecases';

// The device of the user comes from the frontend, which is the one that sees the browser
function endUserOf(req: Request): EndUser {
  return {
    ip        : req.header('x-end-user-ip'),
    userAgent : req.header('x-end-user-agent'),
  };
}

@injectable()
export class AuthController {
  constructor(
    @inject(ExchangeCodeUseCase)
    private readonly exchangeCodeUseCase: ExchangeCodeUseCase,
    @inject(RefreshTokenUseCase)
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    @inject(LogoutUseCase)
    private readonly logoutUseCase: LogoutUseCase,
    @inject(LogoutAllUseCase)
    private readonly logoutAllUseCase: LogoutAllUseCase
  ) {}

  async exchangeCode(req: Request, res: Response) {
    const tokens = await this.exchangeCodeUseCase.execute(req.body, endUserOf(req));
    return res.status(200).json(tokens);
  }

  async refresh(req: Request, res: Response) {
    const tokens = await this.refreshTokenUseCase.execute(req.body, endUserOf(req));
    return res.status(200).json(tokens);
  }

  async logout(req: Request, res: Response) {
    await this.logoutUseCase.execute(req.body, endUserOf(req));
    return res.status(204).send();
  }

  async logoutAll(req: Request, res: Response) {
    await this.logoutAllUseCase.execute(req.body, endUserOf(req));
    return res.status(204).send();
  }
}
