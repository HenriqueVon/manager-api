import '@docs/openapi/__tests__/test-env';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LogoutAllUseCase } from '../../usecases/logout-all.usecase';
import { AuthService } from '@services/auth/auth.service';

describe('LogoutAllUseCase', () => {
  let authService: AuthService;
  let sut: LogoutAllUseCase;

  const endUser = { ip: '198.51.100.7', userAgent: 'Mozilla/5.0' };

  beforeEach(() => {
    authService = {
      logoutAll: vi.fn(),
    } as unknown as AuthService;

    sut = new LogoutAllUseCase(authService);
  });

  it('should log out from all devices with the refresh token', async () => {
    vi.mocked(authService.logoutAll).mockResolvedValue(undefined);

    await sut.execute({ refreshToken: 'session.secret' }, endUser);

    expect(authService.logoutAll).toHaveBeenCalledWith('session.secret', endUser);
  });
});
