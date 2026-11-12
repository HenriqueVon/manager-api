import { inject, injectable } from 'tsyringe';
import { AuthService, type EndUser } from '@services/auth/auth.service';
import { RefreshTokenDto } from '../dtos';

@injectable()
export class LogoutUseCase {
  constructor(
    @inject(AuthService)
    private readonly authService: AuthService
  ) {}

  async execute(data: RefreshTokenDto, endUser: EndUser): Promise<void> {
    await this.authService.logout(data.refreshToken, endUser);
  }
}
