import '@docs/openapi/__tests__/test-env';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RefreshTokenUseCase } from '../../usecases/refresh-token.usecase';
import { AuthService } from '@services/auth/auth.service';

describe('RefreshTokenUseCase', () => {
  let authService: AuthService;
  let sut: RefreshTokenUseCase;

  const endUser = { ip: '198.51.100.7', userAgent: 'Mozilla/5.0' };
  const tokens = { accessToken: 'a', tokenType: 'Bearer', expiresIn: 900, refreshToken: 'r2' };

  beforeEach(() => {
    authService = {
      refresh: vi.fn(),
    } as unknown as AuthService;

    sut = new RefreshTokenUseCase(authService);
  });

  it('should refresh with the refresh token and return the new tokens', async () => {
    vi.mocked(authService.refresh).mockResolvedValue(tokens);

    const result = await sut.execute({ refreshToken: 'session.secret' }, endUser);

    expect(result).toEqual(tokens);
    expect(authService.refresh).toHaveBeenCalledWith('session.secret', endUser);
  });

  it('should let the error of the authentication API propagate', async () => {
    const error = new Error('refused');
    vi.mocked(authService.refresh).mockRejectedValue(error);

    await expect(sut.execute({ refreshToken: 'session.secret' }, endUser)).rejects.toBe(error);
  });
});
