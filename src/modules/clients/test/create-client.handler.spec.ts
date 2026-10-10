import { BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { createPrismaMock, PrismaMock } from 'test/helpers/prisma.mock';
import { CreateClientHandler } from '../command/handler/create-client.handler';
import { CreateClientCommand } from '../command/impl/create-client.command';

jest.mock('src/database/prisma.service', () => ({
  PrismaService: class {},
}));

const prismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError('x', {
    code,
    clientVersion: 'test',
  });

describe('CreateClientHandler', () => {
  let prisma: PrismaMock;
  let handler: CreateClientHandler;
  const data: any = {
    firstName: 'Ana',
    surname: 'Pérez',
    phoneNumber: '55512345',
  };

  beforeEach(() => {
    prisma = createPrismaMock();
    handler = new CreateClientHandler(prisma as any);
  });

  it('crea el cliente con los datos del comando y devuelve 201', async () => {
    const created = { id: 'c1', ...data };
    prisma.client.create.mockResolvedValue(created);

    const result = await handler.execute(new CreateClientCommand(data));

    expect(prisma.client.create).toHaveBeenCalledWith({ data });
    expect(result).toEqual({
      statusCode: 201,
      data: created,
      message: 'SUCCESS',
    });
  });

  it('devuelve 409 si el teléfono o correo ya existe (P2002)', async () => {
    prisma.client.create.mockRejectedValue(prismaError('P2002'));

    await expect(
      handler.execute(new CreateClientCommand(data)),
    ).rejects.toThrow(ConflictException);
  });

  it('devuelve 400 si un valor es demasiado largo (P2000)', async () => {
    prisma.client.create.mockRejectedValue(prismaError('P2000'));

    await expect(
      handler.execute(new CreateClientCommand(data)),
    ).rejects.toThrow(BadRequestException);
  });

  it('relanza errores inesperados', async () => {
    prisma.client.create.mockRejectedValue(new Error('db caída'));

    await expect(
      handler.execute(new CreateClientCommand(data)),
    ).rejects.toThrow('db caída');
  });
});
