import { NotFoundException } from '@nestjs/common';
import { createPrismaMock, PrismaMock } from 'test/helpers/prisma.mock';
import { GetOneEmployeeByFiltersHandler } from '../query/handler/get-one-employee-by-filters.handler';
import { GetOneEmployeeByFiltersQuery } from '../query/impl';



jest.mock('src/database/prisma.service', () => ({
  PrismaService: class {},
}));

describe('GetOneEmployeeByFiltersHandler', () => {
  let prisma: PrismaMock;
  let handler: GetOneEmployeeByFiltersHandler;

  beforeEach(() => {
    prisma = createPrismaMock();
    handler = new GetOneEmployeeByFiltersHandler(prisma as any);
  });

  it('construye el where con los filtros y devuelve el empleado', async () => {
    const employee = { id: 'emp-1', firstName: 'Kevin' };
    prisma.employee.findFirst.mockResolvedValue(employee);

    const result = await handler.execute(
      new GetOneEmployeeByFiltersQuery({ firstName: 'kev', status: true } as any),
    );

    expect(prisma.employee.findFirst).toHaveBeenCalledWith({
      where: {
        firstName: { contains: 'kev', mode: 'insensitive' },
        status: true,
      },
    });
    expect(result.data).toBe(employee);
    expect(result.message).toBe('Información encontrada satisfactoriamente.');
  });

  it('lanza NotFoundException e incluye los filtros en el mensaje', async () => {
    prisma.employee.findFirst.mockResolvedValue(null);
    const filters: any = { email: 'nadie@example.com' };

    await expect(handler.execute(new GetOneEmployeeByFiltersQuery(filters))).rejects.toThrow(
      NotFoundException,
    );
    await expect(handler.execute(new GetOneEmployeeByFiltersQuery(filters))).rejects.toThrow(
      JSON.stringify(filters),
    );
  });

  it('relanza errores inesperados', async () => {
    prisma.employee.findFirst.mockRejectedValue(new Error('db caída'));

    await expect(
      handler.execute(new GetOneEmployeeByFiltersQuery({} as any)),
    ).rejects.toThrow('db caída');
  });
});
