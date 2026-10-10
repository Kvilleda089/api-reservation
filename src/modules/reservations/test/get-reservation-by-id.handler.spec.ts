import { NotFoundException } from '@nestjs/common';
import { createPrismaMock, PrismaMock } from 'test/helpers/prisma.mock';
import { GetReservationByIdHandler } from '../query/handler/get-reservation-by-id.handler';
import { GetReservationByIdQuery } from '../query/imp/get-reservation-by-id.query';

jest.mock('src/database/prisma.service', () => ({
  PrismaService: class {},
}));

describe('GetReservationByIdHandler', () => {
  let prisma: PrismaMock;
  let handler: GetReservationByIdHandler;

  beforeEach(() => {
    prisma = createPrismaMock();
    handler = new GetReservationByIdHandler(prisma as any);
  });

  it('devuelve la reservación con su cliente y abonos', async () => {
    const reservation = { id: 'res-1', client: { id: 'c1' }, deposits: [] };
    prisma.reservation.findFirst.mockResolvedValue(reservation);

    const result = await handler.execute(new GetReservationByIdQuery('res-1'));

    expect(prisma.reservation.findFirst).toHaveBeenCalledWith({
      where: { id: 'res-1' },
      include: { client: true, deposits: true },
    });
    expect(result).toEqual({
      statusCode: 200,
      message: 'Datos encontrados correctamente',
      data: reservation,
    });
  });

  it('lanza NotFoundException si no existe', async () => {
    prisma.reservation.findFirst.mockResolvedValue(null);

    await expect(handler.execute(new GetReservationByIdQuery('nada'))).rejects.toThrow(
      NotFoundException,
    );
  });

  it('relanza errores inesperados', async () => {
    prisma.reservation.findFirst.mockRejectedValue(new Error('db caída'));

    await expect(handler.execute(new GetReservationByIdQuery('res-1'))).rejects.toThrow('db caída');
  });
});
