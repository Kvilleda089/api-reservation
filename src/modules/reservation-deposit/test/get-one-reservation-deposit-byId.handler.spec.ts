import { NotFoundException } from '@nestjs/common';
import { createPrismaMock, PrismaMock } from 'test/helpers/prisma.mock';
import { GetOneReservationDepositHandler } from '../query/handler/get-one-reservation-deposit-byId.handler';
import { GetOneReservationDepositByIdQuery } from '../query/impl/get-one-reservation-deposit-byId.query';

jest.mock('src/database/prisma.service', () => ({
  PrismaService: class {},
}));

describe('GetOneReservationDepositHandler', () => {
  let prisma: PrismaMock;
  let handler: GetOneReservationDepositHandler;

  beforeEach(() => {
    prisma = createPrismaMock();
    handler = new GetOneReservationDepositHandler(prisma as any);
  });

  it('busca por id del abono', async () => {
    const deposits = [{ id: 'd1' }];
    prisma.reservationDeposit.findMany.mockResolvedValue(deposits);

    const result = await handler.execute(
      new GetOneReservationDepositByIdQuery('d1', undefined),
    );

    expect(prisma.reservationDeposit.findMany).toHaveBeenCalledWith({
      where: { id: 'd1' },
    });
    expect(result).toEqual({
      statusCode: 200,
      message: 'Resultados encontrados',
      data: deposits,
    });
  });

  it('busca por reservationId y devuelve todos sus abonos', async () => {
    const deposits = [{ id: 'd1' }, { id: 'd2' }];
    prisma.reservationDeposit.findMany.mockResolvedValue(deposits);

    const result = await handler.execute(
      new GetOneReservationDepositByIdQuery(undefined, 'res-1'),
    );

    expect(prisma.reservationDeposit.findMany).toHaveBeenCalledWith({
      where: { reservationId: 'res-1' },
    });
    expect(result.data).toHaveLength(2);
  });

  it('combina id y reservationId cuando vienen ambos', async () => {
    prisma.reservationDeposit.findMany.mockResolvedValue([{ id: 'd1' }]);

    await handler.execute(new GetOneReservationDepositByIdQuery('d1', 'res-1'));

    expect(prisma.reservationDeposit.findMany).toHaveBeenCalledWith({
      where: { id: 'd1', reservationId: 'res-1' },
    });
  });

  it('lanza NotFoundException si no hay resultados', async () => {
    prisma.reservationDeposit.findMany.mockResolvedValue([]);

    await expect(
      handler.execute(new GetOneReservationDepositByIdQuery('nada', undefined)),
    ).rejects.toThrow(NotFoundException);
  });

  it('relanza errores inesperados', async () => {
    prisma.reservationDeposit.findMany.mockRejectedValue(new Error('db caída'));

    await expect(
      handler.execute(new GetOneReservationDepositByIdQuery('d1', undefined)),
    ).rejects.toThrow('db caída');
  });
});
