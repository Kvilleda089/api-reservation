import { BadRequestException, ConflictException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from 'src/generated/prisma/client';
import { createPrismaMock, PrismaMock } from 'test/helpers/prisma.mock';
import { LoginHandler } from '../command/handler/login.handler';
import { LoginCommand } from '../command/impl';

jest.mock('bcrypt', () => ({ compare: jest.fn(), hash: jest.fn() }));
jest.mock('src/database/prisma.service', () => ({
  PrismaService: class {},
}));

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('LoginHandler', () => {
  let prisma: PrismaMock;
  let jwtService: { sign: jest.Mock; decode: jest.Mock };
  let handler: LoginHandler;
  const compare = bcrypt.compare as unknown as jest.Mock;

  const employee = {
    id: 'emp-1',
    username: 'KV1234',
    password: 'hashed-password',
    firstName: 'Kevin',
    surname: 'Villeda',
    role: 'ADMINISTRATOR',
    status: true,
  };
  const command = new LoginCommand({ username: 'KV1234', password: 'secret' });

  beforeEach(() => {
    // Opcional: evita ensuciar la consola con los ERROR esperados
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    prisma = createPrismaMock();
    jwtService = {
      sign: jest.fn().mockReturnValue('jwt-token'),
      decode: jest.fn().mockReturnValue({ exp: 1900000000 }),
    };
    compare.mockReset();
    handler = new LoginHandler(prisma as any, jwtService as any);
  });

  it('inicia sesión: valida credenciales, firma el JWT y registra la sesión', async () => {
    prisma.employee.findFirst.mockResolvedValue(employee);
    prisma.userSession.create.mockResolvedValue({});
    compare.mockResolvedValue(true);

    const result = await handler.execute(command);

    expect(prisma.employee.findFirst).toHaveBeenCalledWith({
      where: { username: 'KV1234', status: true },
    });
    expect(compare).toHaveBeenCalledWith('secret', 'hashed-password');

    const [payload, options] = jwtService.sign.mock.calls[0];
    expect(payload).toEqual({ sub: 'emp-1', username: 'KV1234', role: 'ADMINISTRATOR' });
    expect(options.jwtid).toMatch(UUID_REGEX);

    expect(prisma.userSession.create).toHaveBeenCalledWith({
      data: {
        employeeId: 'emp-1',
        tokenId: options.jwtid,
        expiresAt: new Date(1900000000 * 1000),
      },
    });

    expect(result).toEqual({
      accessToken: 'jwt-token',
      employee: {
        id: 'emp-1',
        username: 'KV1234',
        firstName: 'Kevin',
        surname: 'Villeda',
        role: 'ADMINISTRATOR',
      },
    });
  });

  it('no expone el hash de la contraseña en la respuesta', async () => {
    prisma.employee.findFirst.mockResolvedValue(employee);
    prisma.userSession.create.mockResolvedValue({});
    compare.mockResolvedValue(true);

    const result = await handler.execute(command);

    expect(JSON.stringify(result)).not.toContain('hashed-password');
  });

  it('cada login genera un tokenId distinto', async () => {
    prisma.employee.findFirst.mockResolvedValue(employee);
    prisma.userSession.create.mockResolvedValue({});
    compare.mockResolvedValue(true);

    await handler.execute(command);
    await handler.execute(command);

    const [first, second] = jwtService.sign.mock.calls.map(([, opts]) => opts.jwtid);
    expect(first).not.toBe(second);
  });

  it('rechaza si el usuario no existe o está inactivo', async () => {
    prisma.employee.findFirst.mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
    await expect(handler.execute(command)).rejects.toThrow(/no se ha encontrado información/i);
    expect(compare).not.toHaveBeenCalled();
    expect(jwtService.sign).not.toHaveBeenCalled();
    expect(prisma.userSession.create).not.toHaveBeenCalled();
  });

  it('rechaza si la contraseña es incorrecta y no crea sesión', async () => {
    prisma.employee.findFirst.mockResolvedValue(employee);
    compare.mockResolvedValue(false);

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
    await expect(handler.execute(command)).rejects.toThrow(/Credenciales incorrectas/);
    expect(jwtService.sign).not.toHaveBeenCalled();
    expect(prisma.userSession.create).not.toHaveBeenCalled();
  });

  it('traduce errores conocidos de Prisma (P2002 -> ConflictException)', async () => {
    prisma.employee.findFirst.mockResolvedValue(employee);
    compare.mockResolvedValue(true);
    prisma.userSession.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('dup', { code: 'P2002', clientVersion: 'test' }),
    );

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
  });

  it('relanza errores inesperados', async () => {
    prisma.employee.findFirst.mockRejectedValue(new Error('db caída'));

    await expect(handler.execute(command)).rejects.toThrow('db caída');
  });
});