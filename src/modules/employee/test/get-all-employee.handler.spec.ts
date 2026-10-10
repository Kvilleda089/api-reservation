import { employeeSelect } from 'src/database/select/employee.select';
import { createPrismaMock, PrismaMock } from 'test/helpers/prisma.mock';
import { GetAllEmployeeHandler } from '../query/handler/get-all-employee.handler';
import { GetAllEmployeeQuery } from '../query/impl';

jest.mock('src/database/prisma.service', () => ({
  PrismaService: class {},
}));

describe('GetAllEmployeeHandler', () => {
  let prisma: PrismaMock;
  let handler: GetAllEmployeeHandler;

  beforeEach(() => {
    prisma = createPrismaMock();
    handler = new GetAllEmployeeHandler(prisma as any);
  });

  it('usa page=1 y limit=10 por defecto y devuelve la paginación', async () => {
    const employees = [{ id: '1' }, { id: '2' }];
    prisma.employee.count.mockResolvedValue(25);
    prisma.employee.findMany.mockResolvedValue(employees);

    const result = await handler.execute(new GetAllEmployeeQuery({}));

    expect(prisma.employee.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      select: employeeSelect,
    });
    expect(result).toEqual({
      statusCode: 200,
      data: employees,
      message: 'Resultados obtenidos',
      pagination: { page: 1, limit: 10, totalRecords: 25, lastPage: 3 },
    });
  });

  it('calcula skip a partir de page y limit', async () => {
    prisma.employee.count.mockResolvedValue(50);
    prisma.employee.findMany.mockResolvedValue([]);

    await handler.execute(new GetAllEmployeeQuery({ page: 3, limit: 5 }));

    expect(prisma.employee.findMany).toHaveBeenCalledWith({
      skip: 10,
      take: 5,
      select: employeeSelect,
    });
  });

  it('con tabla vacía devuelve lista vacía y lastPage 0', async () => {
    prisma.employee.count.mockResolvedValue(0);
    prisma.employee.findMany.mockResolvedValue([]);

    const result = await handler.execute(new GetAllEmployeeQuery({}));

    expect(result.data).toEqual([]);
    expect(result.pagination?.lastPage).toBe(0);
  });

  it('relanza errores inesperados', async () => {
    prisma.employee.count.mockRejectedValue(new Error('db caída'));

    await expect(handler.execute(new GetAllEmployeeQuery({}))).rejects.toThrow(
      'db caída',
    );
  });
});
