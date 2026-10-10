import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { employeeSelect } from 'src/database/select/employee.select';
import { Prisma } from 'src/generated/prisma/client';
import { generateUsername } from 'src/modules/employee/common/helper/username.helper';
import { createPrismaMock, PrismaMock } from 'test/helpers/prisma.mock';
import { CreateEmployeeHandler } from '../command/handler/create-employee.handler';
import { CreateEmployeeCommand } from '../command/impl';

jest.mock('src/database/prisma.service', () => ({
  PrismaService: class {},
}));

jest.mock('bcrypt', () => ({ hash: jest.fn(), compare: jest.fn() }));
jest.mock('src/modules/employee/common/helper/username.helper', () => ({
  generateUsername: jest.fn(),
}));

describe('CreateEmployeeHandler', () => {
  let prisma: PrismaMock;
  let handler: CreateEmployeeHandler;
  const hash = bcrypt.hash as unknown as jest.Mock;
  const username = generateUsername as jest.Mock;

  const dto: any = {
    firstName: 'Kevin',
    middleName: 'Eduardo',
    surname: 'Villeda',
    secondSurname: 'Trujillo',
    email: 'kevin@example.com',
    phoneNumber: '12345678',
    password: 'Secret123',
    role: 'ADMINISTRATOR',
    hireDate: new Date('2026-01-10'),
  };

  beforeEach(() => {
    prisma = createPrismaMock();
    hash.mockReset().mockResolvedValue('hashed-pass');
    username.mockReset().mockReturnValue('KV1234');
    handler = new CreateEmployeeHandler(prisma as any);
  });

  it('crea el empleado con contraseña hasheada y usuario generado', async () => {
    const created = { id: 'emp-1', username: 'KV1234' };
    prisma.employee.create.mockResolvedValue(created);

    const result = await handler.execute(new CreateEmployeeCommand(dto));

    const rest = Object.fromEntries(
      Object.entries(dto).filter(([key]) => key !== 'password'),
    );

    expect(hash).toHaveBeenCalledWith('Secret123', 10);
    expect(username).toHaveBeenCalledWith('Kevin', 'Villeda');
    expect(prisma.employee.create).toHaveBeenCalledWith({
      data: { ...rest, password: 'hashed-pass', username: 'KV1234' },
      select: employeeSelect,
    });
    expect(result).toEqual({
      statusCode: 201,
      message: 'Empleado creado correctamente',
      data: created,
    });
  });
  it('nunca guarda la contraseña en texto plano', async () => {
    prisma.employee.create.mockResolvedValue({});

    await handler.execute(new CreateEmployeeCommand(dto));

    const { data } = prisma.employee.create.mock.calls[0][0];
    expect(data.password).not.toBe('Secret123');
  });

  it('ignora el username enviado por el cliente y usa el generado', async () => {
    prisma.employee.create.mockResolvedValue({});

    await handler.execute(
      new CreateEmployeeCommand({ ...dto, username: 'hacker' }),
    );

    const { data } = prisma.employee.create.mock.calls[0][0];
    expect(data.username).toBe('KV1234');
  });

  it('devuelve 409 cuando el email/usuario/teléfono ya existe (P2002)', async () => {
    prisma.employee.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('dup', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      handler.execute(new CreateEmployeeCommand(dto)),
    ).rejects.toThrow(ConflictException);
  });

  it('relanza errores inesperados', async () => {
    prisma.employee.create.mockRejectedValue(new Error('db caída'));

    await expect(
      handler.execute(new CreateEmployeeCommand(dto)),
    ).rejects.toThrow('db caída');
  });
});
