import { inject, injectable } from 'tsyringe';
import { AuthService, type EndUser, type TokenResponse } from '@services/auth/auth.service';
import { ExchangeCodeDto } from '../dtos';

@injectable()
export class ExchangeCodeUseCase {
  constructor(
    @inject(AuthService)
    private readonly authService: AuthService
  ) {}

  async execute(data: ExchangeCodeDto, endUser: EndUser): Promise<TokenResponse> {
    return this.authService.exchangeCode(data, endUser);
  }
}
