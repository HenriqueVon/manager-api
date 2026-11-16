import '@docs/openapi/__tests__/test-env';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LogoutUseCase } from '../../usecases/logout.usecase';
import { AuthService } from '@services/auth/auth.service';

describe('LogoutUseCase', () => {
  let authService: AuthService;
  let sut: LogoutUseCase;

  const endUser = { ip: '198.51.100.7', userAgent: 'Mozilla/5.0' };

  beforeEach(() => {
    authService = {
      logout: vi.fn(),
    } as unknown as AuthService;

    sut = new LogoutUseCase(authService);
  });

  it('should log out with the refresh token', async () => {
    vi.mocked(authService.logout).mockResolvedValue(undefined);

    await sut.execute({ refreshToken: 'session.secret' }, endUser);

    expect(authService.logout).toHaveBeenCalledWith('session.secret', endUser);
  });
});
