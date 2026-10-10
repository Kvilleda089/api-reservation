import { createPrismaMock, PrismaMock } from 'test/helpers/prisma.mock';
import { GetReservationCheckoutAvailableHandler } from '../query/handler/get-reservation-checkout-available.handler';
import { GetReservationCheckoutAvailableQuery } from '../query/imp/get-reservation-checkout-available.query';



jest.mock('src/database/prisma.service', () => ({
  PrismaService: class {},
}));

describe('GetReservationCheckoutAvailableHandler', () => {
  let prisma: PrismaMock;
  let handler: GetReservationCheckoutAvailableHandler;

  const filters: any = {
    reservationDate: new Date('2026-10-20T00:00:00.000Z'),
    reservationResource: 'CANCHA_2',
    hour: '09:45',
  };

  beforeEach(() => {
    prisma = createPrismaMock();
    handler = new GetReservationCheckoutAvailableHandler(prisma as any);
  });

  it('busca reservaciones no canceladas con la misma fecha, hora y recurso', async () => {
    prisma.reservation.findMany.mockResolvedValue([]);

    await handler.execute(new GetReservationCheckoutAvailableQuery(filters));

    expect(prisma.reservation.findMany).toHaveBeenCalledWith({
      where: {
        reservationDate: filters.reservationDate,
        hour: new Date('2026-10-20T09:45:00.000Z'),
        reservationResource: 'CANCHA_2',
        status: { not: 'CANCELADA' },
      },
    });
  });

  it('devuelve las coincidencias (data vacía = horario disponible)', async () => {
    prisma.reservation.findMany.mockResolvedValue([]);
    const free = await handler.execute(new GetReservationCheckoutAvailableQuery(filters));
    expect(free).toEqual({ statusCode: 200, message: 'Resultados Obtenidos', data: [] });

    prisma.reservation.findMany.mockResolvedValue([{ id: 'r1' }]);
    const busy = await handler.execute(new GetReservationCheckoutAvailableQuery(filters));
    expect(busy.data).toEqual([{ id: 'r1' }]);
  });

  it('relanza errores inesperados', async () => {
    prisma.reservation.findMany.mockRejectedValue(new Error('db caída'));

    await expect(
      handler.execute(new GetReservationCheckoutAvailableQuery(filters)),
    ).rejects.toThrow('db caída');
  });
});
