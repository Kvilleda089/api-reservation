import { createPrismaMock, PrismaMock } from 'test/helpers/prisma.mock';
import { GetAllReservationHandler } from '../query/handler/get-all-reservation.handler';
import { GetAllReservationQuery } from '../query/imp/get-all-reservation.query';


jest.mock('src/database/prisma.service', () => ({
  PrismaService: class {},
}));


describe('GetAllReservationHandler', () => {
  let prisma: PrismaMock;
  let handler: GetAllReservationHandler;

  beforeEach(() => {
    prisma = createPrismaMock();
    handler = new GetAllReservationHandler(prisma as any);
  });

  it('sin filtros usa page=1, limit=10, where vacío e incluye el cliente', async () => {
    const reservations = [{ id: 'r1' }];
    prisma.reservation.count.mockResolvedValue(1);
    prisma.reservation.findMany.mockResolvedValue(reservations);

    const result = await handler.execute(new GetAllReservationQuery({}));

    expect(prisma.reservation.count).toHaveBeenCalledWith({ where: {} });
    expect(prisma.reservation.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 10,
      include: { client: true },
    });
    expect(result).toEqual({
      statusCode: 200,
      data: reservations,
      message: 'Resultados obtenidos',
      pagination: { page: 1, limit: 10, totalRecords: 1, lastPage: 1 },
    });
  });

  it('aplica filtros de estado y cliente, y la paginación, sin mezclar page/limit en el where', async () => {
    prisma.reservation.count.mockResolvedValue(11);
    prisma.reservation.findMany.mockResolvedValue([]);

    const result = await handler.execute(
      new GetAllReservationQuery({ page: 2, limit: 5, status: 'CONFIRMADA', client: 'ana' } as any),
    );

    const where = {
      client: {
        OR: [
          { firstName: { contains: 'ana', mode: 'insensitive' } },
          { surname: { contains: 'ana', mode: 'insensitive' } },
          { secondSurname: { contains: 'ana', mode: 'insensitive' } },
        ],
      },
      status: 'CONFIRMADA',
    };
    expect(prisma.reservation.count).toHaveBeenCalledWith({ where });
    expect(prisma.reservation.findMany).toHaveBeenCalledWith({
      where,
      skip: 5,
      take: 5,
      include: { client: true },
    });
    expect(result.pagination).toEqual({ page: 2, limit: 5, totalRecords: 11, lastPage: 3 });
  });

  it('relanza errores inesperados', async () => {
    prisma.reservation.count.mockRejectedValue(new Error('db caída'));

    await expect(handler.execute(new GetAllReservationQuery({}))).rejects.toThrow('db caída');
  });
});
