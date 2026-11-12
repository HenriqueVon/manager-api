import { inject, injectable } from 'tsyringe';
import { AuthService, type EndUser, type TokenResponse } from '@services/auth/auth.service';
import { RefreshTokenDto } from '../dtos';

@injectable()
export class RefreshTokenUseCase {
  constructor(
    @inject(AuthService)
    private readonly authService: AuthService
  ) {}

  async execute(data: RefreshTokenDto, endUser: EndUser): Promise<TokenResponse> {
    return this.authService.refresh(data.refreshToken, endUser);
  }
}
