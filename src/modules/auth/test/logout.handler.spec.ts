import { createPrismaMock, PrismaMock } from 'test/helpers/prisma.mock';
import { LogoutHandler } from '../command/handler/logout.handler';
import { LogoutCommand } from '../command/impl';

jest.mock('src/database/prisma.service', () => ({
  PrismaService: class {},
}));

describe('LogoutHandler', () => {
  let prisma: PrismaMock;
  let handler: LogoutHandler;

  beforeEach(() => {
    prisma = createPrismaMock();
    handler = new LogoutHandler(prisma as any);
  });

  it('revoca la sesión activa del token indicado', async () => {
    prisma.userSession.updateMany.mockResolvedValue({ count: 1 });

    await handler.execute(new LogoutCommand('emp-1', 'KV1234', 'token-1'));

    expect(prisma.userSession.updateMany).toHaveBeenCalledWith({
      where: { tokenId: 'token-1', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it('solo toca sesiones que no estaban revocadas (idempotente)', async () => {
    prisma.userSession.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      handler.execute(
        new LogoutCommand('emp-1', 'KV1234', 'token-ya-revocado'),
      ),
    ).resolves.toBeUndefined();

    const { where } = prisma.userSession.updateMany.mock.calls[0][0];
    expect(where.revokedAt).toBeNull();
  });

  it('propaga el error si la base de datos falla', async () => {
    prisma.userSession.updateMany.mockRejectedValue(new Error('db caída'));

    await expect(
      handler.execute(new LogoutCommand('emp-1', 'KV1234', 'token-1')),
    ).rejects.toThrow('db caída');
  });
});
