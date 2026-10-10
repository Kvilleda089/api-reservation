import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { employeeSelect } from 'src/database/select/employee.select';
import { createPrismaMock, PrismaMock } from 'test/helpers/prisma.mock';
import { ChangePasswordHandler } from '../command/handler/change-password.handler';
import { ChangePasswordCommand } from '../command/impl';


jest.mock('src/database/prisma.service', () => ({
  PrismaService: class {},
}));


jest.mock('bcrypt', () => ({ hash: jest.fn(), compare: jest.fn() }));

describe('ChangePasswordHandler', () => {
  let prisma: PrismaMock;
  let handler: ChangePasswordHandler;
  const compare = bcrypt.compare as unknown as jest.Mock;
  const hash = bcrypt.hash as unknown as jest.Mock;

  const command = new ChangePasswordCommand('emp-1', {
    currentPassword: 'actual123',
    newPassword: 'nueva12345',
  });

  beforeEach(() => {
    prisma = createPrismaMock();
    compare.mockReset();
    hash.mockReset().mockResolvedValue('new-hash');
    handler = new ChangePasswordHandler(prisma as any);
  });

  it('cambia la contraseña cuando la actual es correcta', async () => {
    prisma.employee.findFirst.mockResolvedValue({ id: 'emp-1', password: 'old-hash' });
    compare.mockResolvedValue(true);
    prisma.employee.update.mockResolvedValue({ id: 'emp-1' });

    const result = await handler.execute(command);

    expect(prisma.employee.findFirst).toHaveBeenCalledWith({
      where: { id: 'emp-1' },
      select: { id: true, password: true },
    });
    expect(compare).toHaveBeenCalledWith('actual123', 'old-hash');
    expect(hash).toHaveBeenCalledWith('nueva12345', 10);
    expect(prisma.employee.update).toHaveBeenCalledWith({
      where: { id: 'emp-1' },
      data: { password: 'new-hash' },
      select: employeeSelect,
    });
    expect(result).toEqual({
      statusCode: 200,
      message: 'Actualización realizada correctamente',
      data: { id: 'emp-1' },
    });
  });

  it('lanza NotFoundException si el empleado no existe', async () => {
    prisma.employee.findFirst.mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    expect(compare).not.toHaveBeenCalled();
    expect(prisma.employee.update).not.toHaveBeenCalled();
  });

  it('lanza BadRequestException si la contraseña actual es incorrecta y no actualiza', async () => {
    prisma.employee.findFirst.mockResolvedValue({ id: 'emp-1', password: 'old-hash' });
    compare.mockResolvedValue(false);

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
    expect(hash).not.toHaveBeenCalled();
    expect(prisma.employee.update).not.toHaveBeenCalled();
  });
});
