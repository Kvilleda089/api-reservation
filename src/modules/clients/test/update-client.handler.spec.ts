import { NotFoundException } from '@nestjs/common';
import { createPrismaMock, PrismaMock } from 'test/helpers/prisma.mock';
import { UpdateClientHandler } from '../command/handler/update-client.handler';
import { UpdateClientCommand } from '../command/impl/update-client.command';


jest.mock('src/database/prisma.service', () => ({
  PrismaService: class {},
}));

describe('UpdateClientHandler', () => {
  let prisma: PrismaMock;
  let handler: UpdateClientHandler;

  beforeEach(() => {
    prisma = createPrismaMock();
    handler = new UpdateClientHandler(prisma as any);
  });

  it('actualiza un cliente existente y devuelve 200', async () => {
    const changes: any = { firstName: 'Nuevo' };
    prisma.client.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.client.update.mockResolvedValue({ id: 'c1', firstName: 'Nuevo' });

    const result = await handler.execute(new UpdateClientCommand('c1', changes));

    expect(prisma.client.findFirst).toHaveBeenCalledWith({ where: { id: 'c1' } });
    expect(prisma.client.update).toHaveBeenCalledWith({ where: { id: 'c1' }, data: changes });
    expect(result).toEqual({
      statusCode: 200,
      message: 'Actualización se ha realizado correctamente.',
      data: { id: 'c1', firstName: 'Nuevo' },
    });
  });

  it('lanza NotFoundException si el cliente no existe y no actualiza', async () => {
    prisma.client.findFirst.mockResolvedValue(null);

    await expect(handler.execute(new UpdateClientCommand('x', {} as any))).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.client.update).not.toHaveBeenCalled();
  });

  it('relanza errores inesperados', async () => {
    prisma.client.findFirst.mockRejectedValue(new Error('db caída'));

    await expect(handler.execute(new UpdateClientCommand('c1', {} as any))).rejects.toThrow(
      'db caída',
    );
  });
});
