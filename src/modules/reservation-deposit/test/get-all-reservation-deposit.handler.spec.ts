import { createPrismaMock, PrismaMock } from 'test/helpers/prisma.mock';
import { GetAllReservationDepositHandler } from '../query/handler/get-all-reservation-deposit.handler';
import { GetAllReservationDepositQuery } from '../query/impl/get-all-reservation-deposit.query';



jest.mock('src/database/prisma.service', () => ({
  PrismaService: class {},
}));



describe('GetAllReservationDepositHandler', () => {
  let prisma: PrismaMock;
  let handler: GetAllReservationDepositHandler;

  beforeEach(() => {
    prisma = createPrismaMock();
    handler = new GetAllReservationDepositHandler(prisma as any);
  });

  it('usa page=1 y limit=10 por defecto y devuelve los abonos', async () => {
    const deposits = [{ id: 'd1' }];
    prisma.client.count.mockResolvedValue(0);
    prisma.reservationDeposit.count.mockResolvedValue(1);
    prisma.reservationDeposit.findMany.mockResolvedValue(deposits);

    const result = await handler.execute(new GetAllReservationDepositQuery({}));

    expect(prisma.reservationDeposit.findMany).toHaveBeenCalledWith({ skip: 0, take: 10 });
    expect(result.statusCode).toBe(200);
    expect(result.data).toBe(deposits);
    expect(result.message).toBe('Resultados obtenidos');
  });

  it('calcula skip/take según la paginación recibida', async () => {
    prisma.reservationDeposit.count.mockResolvedValue(30);
    prisma.reservationDeposit.findMany.mockResolvedValue([]);

    await handler.execute(new GetAllReservationDepositQuery({ page: 3, limit: 4 }));

    expect(prisma.reservationDeposit.findMany).toHaveBeenCalledWith({ skip: 8, take: 4 });
  });

  it.failing('totalRecords y lastPage se calculan con los abonos, no con los clientes', async () => {
    prisma.client.count.mockResolvedValue(99);
    prisma.reservationDeposit.count.mockResolvedValue(7);
    prisma.reservationDeposit.findMany.mockResolvedValue([]);

    const result = await handler.execute(new GetAllReservationDepositQuery({ page: 1, limit: 5 }));

    expect(result.pagination).toEqual({ page: 1, limit: 5, totalRecords: 7, lastPage: 2 });
  });

  it('relanza errores inesperados', async () => {
    prisma.client.count.mockRejectedValue(new Error('db caída'));
    prisma.reservationDeposit.count.mockRejectedValue(new Error('db caída'));

    await expect(handler.execute(new GetAllReservationDepositQuery({}))).rejects.toThrow('db caída');
  });
});
