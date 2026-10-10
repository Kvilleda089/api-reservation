import { NotFoundException } from '@nestjs/common';
import { employeeSelect } from 'src/database/select/employee.select';
import { Prisma } from 'src/generated/prisma/client';
import { createPrismaMock, PrismaMock } from 'test/helpers/prisma.mock';
import { UpdateEmployeeHandler } from '../command/handler/update-employee.handler';
import { UpdateEmployeeCommand } from '../command/impl';


jest.mock('src/database/prisma.service', () => ({
  PrismaService: class {},
}));


describe('UpdateEmployeeHandler', () => {
  let prisma: PrismaMock;
  let handler: UpdateEmployeeHandler;

  beforeEach(() => {
    prisma = createPrismaMock();
    handler = new UpdateEmployeeHandler(prisma as any);
  });

  it('actualiza el empleado existente y devuelve 200', async () => {
    const data: any = { firstName: 'Nuevo' };
    prisma.employee.findFirst.mockResolvedValue({ id: 'emp-1' });
    prisma.employee.update.mockResolvedValue({ id: 'emp-1', firstName: 'Nuevo' });

    const result = await handler.execute(new UpdateEmployeeCommand('emp-1', data));

    expect(prisma.employee.findFirst).toHaveBeenCalledWith({ where: { id: 'emp-1' } });
    expect(prisma.employee.update).toHaveBeenCalledWith({
      where: { id: 'emp-1' },
      data,
      select: employeeSelect,
    });
    expect(result).toEqual({
      statusCode: 200,
      message: 'Actualización realizada correctamente',
      data: { id: 'emp-1', firstName: 'Nuevo' },
    });
  });

  it('lanza NotFoundException si el empleado no existe y no actualiza', async () => {
    prisma.employee.findFirst.mockResolvedValue(null);

    await expect(
      handler.execute(new UpdateEmployeeCommand('no-existe', {} as any)),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.employee.update).not.toHaveBeenCalled();
  });

  it('traduce P2025 de Prisma a NotFoundException', async () => {
    prisma.employee.findFirst.mockResolvedValue({ id: 'emp-1' });
    prisma.employee.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('x', { code: 'P2025', clientVersion: 'test' }),
    );

    await expect(
      handler.execute(new UpdateEmployeeCommand('emp-1', {} as any)),
    ).rejects.toThrow(NotFoundException);
  });
});
