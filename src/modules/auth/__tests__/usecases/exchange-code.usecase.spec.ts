import '@docs/openapi/__tests__/test-env';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExchangeCodeUseCase } from '../../usecases/exchange-code.usecase';
import { AuthService } from '@services/auth/auth.service';

describe('ExchangeCodeUseCase', () => {
  let authService: AuthService;
  let sut: ExchangeCodeUseCase;

  const input = { code: 'code-1', codeVerifier: 'v'.repeat(43), redirectUri: 'https://app.example.com/auth/callback' };
  const endUser = { ip: '198.51.100.7', userAgent: 'Mozilla/5.0' };
  const tokens = { accessToken: 'a', tokenType: 'Bearer', expiresIn: 900, refreshToken: 'r' };

  beforeEach(() => {
    authService = {
      exchangeCode: vi.fn(),
    } as unknown as AuthService;

    sut = new ExchangeCodeUseCase(authService);
  });

  it('should exchange the code and return the tokens', async () => {
    vi.mocked(authService.exchangeCode).mockResolvedValue(tokens);

    const result = await sut.execute(input, endUser);

    expect(result).toEqual(tokens);
    expect(authService.exchangeCode).toHaveBeenCalledWith(input, endUser);
  });

  it('should let the error of the authentication API propagate', async () => {
    const error = new Error('refused');
    vi.mocked(authService.exchangeCode).mockRejectedValue(error);

    await expect(sut.execute(input, endUser)).rejects.toBe(error);
  });
});
