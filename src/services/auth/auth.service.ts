import { Unauthorized } from '@shared/errors/app-error';
import { env } from '@config/env';

export class AuthService {
  async authenticate(authorization?: string): Promise<void> {
    if (!authorization) {
      throw new Unauthorized('Missing Authorization header');
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new Unauthorized('Invalid Authorization header');
    }

    await this.validateToken(token);
  }

  private async validateToken(token: string): Promise<void> {
    const response = await fetch(`${env.authApiBaseUrl}/auth/validate`, {
      method  : 'GET',
      headers : {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {      
      throw new Unauthorized('Invalid or expired token');
    }
  }
}