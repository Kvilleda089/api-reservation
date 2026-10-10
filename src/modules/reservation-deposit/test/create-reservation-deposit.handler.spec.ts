import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createPrismaMock, PrismaMock } from 'test/helpers/prisma.mock';
import { CreateReservationDepositHandler } from '../command/handler/create-reservation-deposit.handler';
import { CreateReservationDepositCommand } from '../command/impl/create-reservation-deposit.command';

jest.mock('src/database/prisma.service', () => ({
  PrismaService: class {},
}));

describe('CreateReservationDepositHandler', () => {
  let prisma: PrismaMock;
  let handler: CreateReservationDepositHandler;

  const reservation = (overrides: Record<string, unknown> = {}) => ({
    id: 'res-1',
    status: 'PENDIENTE',
    totalReservation: '500.00',
    ...overrides,
  });
  const deposited = (amount: string | null) => ({ _sum: { amount } });
  const command = (amount: number) =>
    new CreateReservationDepositCommand({ reservationId: 'res-1', amount });

  beforeEach(() => {
    prisma = createPrismaMock();
    prisma.reservationDeposit.create.mockImplementation(async ({ data }) => ({
      id: 'dep-1',
      ...data,
    }));
    handler = new CreateReservationDepositHandler(prisma as any);
  });

  it('registra un abono parcial sin cambiar el estado de la reservación', async () => {
    prisma.reservation.findFirst.mockResolvedValue(reservation());
    prisma.reservationDeposit.aggregate.mockResolvedValue(deposited('300.00'));

    const result = await handler.execute(command(100));

    expect(prisma.reservationDeposit.create).toHaveBeenCalledWith({
      data: { reservationId: 'res-1', amount: 100 },
    });
    expect(prisma.reservation.update).not.toHaveBeenCalled();
    expect(result).toEqual({
      statusCode: 201,
      message: 'Se ingresado el abono correctamente',
      data: { id: 'dep-1', reservationId: 'res-1', amount: 100 },
    });
  });

  it('suma los abonos previos de esa reservación', async () => {
    prisma.reservation.findFirst.mockResolvedValue(reservation());
    prisma.reservationDeposit.aggregate.mockResolvedValue(deposited('0'));

    await handler.execute(command(50));

    expect(prisma.reservationDeposit.aggregate).toHaveBeenCalledWith({
      where: { reservationId: 'res-1' },
      _sum: { amount: true },
    });
  });

  it('el primer abono funciona aunque la suma previa sea null', async () => {
    prisma.reservation.findFirst.mockResolvedValue(reservation());
    prisma.reservationDeposit.aggregate.mockResolvedValue(deposited(null));

    await expect(handler.execute(command(100))).resolves.toMatchObject({
      statusCode: 201,
    });
  });

  it('al completar el pago total marca la reservación como FINALIZADA', async () => {
    prisma.reservation.findFirst.mockResolvedValue(reservation());
    prisma.reservationDeposit.aggregate.mockResolvedValue(deposited('300.00'));

    await handler.execute(command(200));

    expect(prisma.reservation.update).toHaveBeenCalledWith({
      where: { id: 'res-1' },
      data: { status: 'FINALIZADA' },
    });
  });

  it('rechaza un abono que supera el total e informa el saldo pendiente', async () => {
    prisma.reservation.findFirst.mockResolvedValue(reservation());
    prisma.reservationDeposit.aggregate.mockResolvedValue(deposited('300.00'));

    await expect(handler.execute(command(250))).rejects.toThrow(
      BadRequestException,
    );
    await expect(handler.execute(command(250))).rejects.toThrow(
      'Saldo pendiente: Q200',
    );
    expect(prisma.reservationDeposit.create).not.toHaveBeenCalled();
    expect(prisma.reservation.update).not.toHaveBeenCalled();
  });

  it('lanza NotFoundException si la reservación no existe', async () => {
    prisma.reservation.findFirst.mockResolvedValue(null);

    await expect(handler.execute(command(100))).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.reservationDeposit.aggregate).not.toHaveBeenCalled();
    expect(prisma.reservationDeposit.create).not.toHaveBeenCalled();
  });

  it.each(['CANCELADA', 'FINALIZADA'])(
    'rechaza abonos si la reservación está %s',
    async (status) => {
      prisma.reservation.findFirst.mockResolvedValue(reservation({ status }));

      await expect(handler.execute(command(100))).rejects.toThrow(
        BadRequestException,
      );
      await expect(handler.execute(command(100))).rejects.toThrow(status);
      expect(prisma.reservationDeposit.create).not.toHaveBeenCalled();
    },
  );

  it.each(['PENDIENTE', 'CONFIRMADA'])(
    'permite abonos si la reservación está %s',
    async (status) => {
      prisma.reservation.findFirst.mockResolvedValue(reservation({ status }));
      prisma.reservationDeposit.aggregate.mockResolvedValue(deposited('0'));

      await expect(handler.execute(command(100))).resolves.toMatchObject({
        statusCode: 201,
      });
    },
  );
});
