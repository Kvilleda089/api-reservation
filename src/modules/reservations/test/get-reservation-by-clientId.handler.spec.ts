import { NotFoundException } from '@nestjs/common';
import { createPrismaMock, PrismaMock } from 'test/helpers/prisma.mock';
import { GetReservationByClientIdHandler } from '../query/handler/get-reservation-by-clientId.handler';
import { GetReservationByClientIdQuery } from '../query/imp/get-reservation-by-clientId.query';


jest.mock('src/database/prisma.service', () => ({
  PrismaService: class {},
}));

describe('GetReservationByClientIdHandler', () => {
  let prisma: PrismaMock;
  let handler: GetReservationByClientIdHandler;

  beforeEach(() => {
    prisma = createPrismaMock();
    handler = new GetReservationByClientIdHandler(prisma as any);
  });

  it('usa page=1 y limit=10 por defecto y filtra por clientId', async () => {
    const reservations = [{ id: 'r1' }];
    prisma.reservation.count.mockResolvedValue(1);
    prisma.reservation.findMany.mockResolvedValue(reservations);

    const result = await handler.execute(new GetReservationByClientIdQuery('c1', {}));

    expect(prisma.reservation.count).toHaveBeenCalledWith({ where: { clientId: 'c1' } });
    expect(prisma.reservation.findMany).toHaveBeenCalledWith({
      where: { clientId: 'c1' },
      skip: 0,
      take: 10,
    });
    expect(result).toEqual({
      statusCode: 200,
      data: reservations,
      message: 'Resultados obtenidos',
      pagination: { page: 1, limit: 10, totalRecords: 1, lastPage: 1 },
    });
  });

  it('aplica la paginación recibida', async () => {
    prisma.reservation.count.mockResolvedValue(12);
    prisma.reservation.findMany.mockResolvedValue([{ id: 'r1' }]);

    const result = await handler.execute(
      new GetReservationByClientIdQuery('c1', { page: 2, limit: 5 }),
    );

    expect(prisma.reservation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 }),
    );
    expect(result.pagination).toEqual({ page: 2, limit: 5, totalRecords: 12, lastPage: 3 });
  });

  it('lanza NotFoundException si el cliente no tiene reservaciones', async () => {
    prisma.reservation.count.mockResolvedValue(0);
    prisma.reservation.findMany.mockResolvedValue([]);
    const query = new GetReservationByClientIdQuery('c-sin-reservas', {});

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    await expect(handler.execute(query)).rejects.toThrow('c-sin-reservas');
  });

  it('relanza errores inesperados', async () => {
    prisma.reservation.count.mockRejectedValue(new Error('db caída'));

    await expect(handler.execute(new GetReservationByClientIdQuery('c1', {}))).rejects.toThrow(
      'db caída',
    );
  });
});
