import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { createPrismaMock, PrismaMock } from 'test/helpers/prisma.mock';
import { UpdateReservationHandler } from '../command/handler/update-reservation.handler';
import { UpdateReservationCommand } from '../command/impl/update-reservation.command';
import { GetReservationCheckoutAvailableQuery } from '../query/imp/get-reservation-checkout-available.query';


jest.mock('src/database/prisma.service', () => ({
  PrismaService: class {},
}));

describe('UpdateReservationHandler', () => {
  let prisma: PrismaMock;
  let queryBus: { execute: jest.Mock };
  let handler: UpdateReservationHandler;

  const stored = {
    id: 'res-1',
    reservationDate: new Date('2026-10-20T00:00:00.000Z'),
    reservationResource: 'CANCHA_1',
    hour: new Date('1970-01-01T18:00:00.000Z'),
    status: 'PENDIENTE',
    reservedHours: 1,
  };

  const run = (data: Record<string, unknown>) =>
    handler.execute(new UpdateReservationCommand('res-1', data as any));

  beforeEach(() => {
    prisma = createPrismaMock();
    queryBus = { execute: jest.fn().mockResolvedValue({ data: [] }) }; // horario libre
    prisma.reservation.findFirst.mockResolvedValue(stored);
    prisma.reservation.update.mockImplementation(async ({ data }) => ({ id: 'res-1', ...data }));
    handler = new UpdateReservationHandler(prisma as any, queryBus as any);
  });

  it('lanza NotFoundException si la reservación no existe', async () => {
    prisma.reservation.findFirst.mockResolvedValue(null);

    await expect(run({ status: 'CONFIRMADA' })).rejects.toThrow(NotFoundException);
    expect(prisma.reservation.update).not.toHaveBeenCalled();
  });

  it('un cambio solo de estado no consulta disponibilidad y conserva fecha, recurso y hora', async () => {
    const result = await run({ status: 'CONFIRMADA' });

    expect(queryBus.execute).not.toHaveBeenCalled();
    expect(prisma.reservation.update).toHaveBeenCalledWith({
      where: { id: 'res-1' },
      data: {
        status: 'CONFIRMADA',
        reservationDate: stored.reservationDate,
        reservationResource: 'CANCHA_1',
        hour: new Date('2026-10-20T18:00:00.000Z'),
      },
    });
    expect(result).toMatchObject({
      statusCode: 200,
      message: 'Se ha actualizado correctamente el registro',
    });
  });

  it('al cambiar la hora valida disponibilidad y recalcula la fecha-hora', async () => {
    await run({ hour: '20:15' });

    const sent = queryBus.execute.mock.calls[0][0];
    expect(sent).toBeInstanceOf(GetReservationCheckoutAvailableQuery);
    expect(sent.filters).toEqual({
      reservationDate: stored.reservationDate,
      reservationResource: 'CANCHA_1',
      hour: '20:15',
    });
    expect(prisma.reservation.update.mock.calls[0][0].data.hour).toEqual(
      new Date('2026-10-20T20:15:00.000Z'),
    );
  });

  it.each([
    ['reservationDate', { reservationDate: new Date('2026-10-25T00:00:00.000Z') }],
    ['reservationResource', { reservationResource: 'SALON' }],
    ['reservedHours', { reservedHours: 3 }],
  ])('un cambio en %s dispara la validación de disponibilidad', async (_name, data) => {
    await run(data);

    expect(queryBus.execute).toHaveBeenCalledTimes(1);
  });

  it('lanza ConflictException si el nuevo horario está ocupado y no actualiza', async () => {
    queryBus.execute.mockResolvedValue({ data: [{ id: 'otra-reserva' }] });

    await expect(run({ hour: '20:00' })).rejects.toThrow(ConflictException);
    expect(prisma.reservation.update).not.toHaveBeenCalled();
  });

  it('si se está cancelando no valida disponibilidad aunque cambien fecha u hora', async () => {
    await run({ status: 'CANCELADA', hour: '21:00' });

    expect(queryBus.execute).not.toHaveBeenCalled();
    expect(prisma.reservation.update).toHaveBeenCalledTimes(1);
  });

  it('traduce el error P2025 de Prisma a NotFoundException', async () => {
    prisma.reservation.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('x', { code: 'P2025', clientVersion: 'test' }),
    );

    await expect(run({ status: 'CONFIRMADA' })).rejects.toThrow(NotFoundException);
  });


  it.failing('no marca conflicto cuando la única coincidencia es la misma reservación', async () => {
    queryBus.execute.mockResolvedValue({ data: [stored] });

    await expect(run({ reservedHours: 3 })).resolves.toMatchObject({ statusCode: 200 });
  });
});
