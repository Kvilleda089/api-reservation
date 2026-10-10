import { UnauthorizedException } from '@nestjs/common';
import { createPrismaMock, PrismaMock } from 'test/helpers/prisma.mock';
import { JwtStrategy } from '../strategy/jwt.strategy';

jest.mock('src/config/envs', () => ({ env: { jwt_secret: 'test-secret' } }));

describe('JwtStrategy.validate', () => {
  let prisma: PrismaMock;
  let strategy: JwtStrategy;

  const payload = {
    sub: 'emp-1',
    username: 'KV1234',
    role: 'ADMINISTRATOR',
    jti: 'token-1',
  };

  beforeEach(() => {
    prisma = createPrismaMock();
    strategy = new JwtStrategy(prisma as any);
  });

  it('rechaza un token sin jti', async () => {
    const withoutJti = { ...payload };
    delete withoutJti.jti;

    await expect(strategy.validate(withoutJti)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(strategy.validate(withoutJti)).rejects.toThrow(
      /Sesión inválida/,
    );
    expect(prisma.userSession.findUnique).not.toHaveBeenCalled();
  });

  it('rechaza si la sesión no existe', async () => {
    prisma.userSession.findUnique.mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(strategy.validate(payload)).rejects.toThrow(
      /sesión fue cerrada/,
    );
  });

  it('rechaza si la sesión fue revocada (logout)', async () => {
    prisma.userSession.findUnique.mockResolvedValue({
      tokenId: 'token-1',
      revokedAt: new Date(),
    });

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('acepta una sesión vigente y devuelve el payload', async () => {
    prisma.userSession.findUnique.mockResolvedValue({
      tokenId: 'token-1',
      revokedAt: null,
    });

    await expect(strategy.validate(payload)).resolves.toBe(payload);
    expect(prisma.userSession.findUnique).toHaveBeenCalledWith({
      where: { tokenId: 'token-1' },
    });
  });
});
