import { ConflictException } from '@nestjs/common';
import { CreateClientCommand } from 'src/modules/clients/command/impl/create-client.command';
import { CreateReservationDepositCommand } from 'src/modules/reservation-deposit/command/impl/create-reservation-deposit.command';
import { createPrismaMock, PrismaMock } from 'test/helpers/prisma.mock';
import { CreateReservationHandler } from '../command/handler/create-reservation.handler';
import { CreateReservationCommand } from '../command/impl/create-reservation.command';
import { GetReservationCheckoutAvailableQuery } from '../query/imp/get-reservation-checkout-available.query';



jest.mock('src/database/prisma.service', () => ({
  PrismaService: class {},
}));

describe('CreateReservationHandler', () => {
  let prisma: PrismaMock;
  let queryBus: { execute: jest.Mock };
  let commandBus: { execute: jest.Mock };
  let handler: CreateReservationHandler;

  const reservationDate = new Date('2026-10-20T00:00:00.000Z');
  const client: any = { firstName: 'Ana', surname: 'Pérez', phoneNumber: '55512345' };
  const reservation: any = {
    hour: '18:30',
    reservationDate,
    reservationResource: 'CANCHA_1',
    status: 'PENDIENTE',
    reservedHours: 1,
    totalReservation: 150,
  };
  const created = { id: 'res-1', clientId: 'c1' };

  const build = (extra: Record<string, unknown> = {}) =>
    new CreateReservationCommand({ client, reservation, ...extra } as any);

  beforeEach(() => {
    prisma = createPrismaMock();
    queryBus = { execute: jest.fn().mockResolvedValue({ data: [] }) }; // horario libre
    commandBus = {
      execute: jest.fn().mockImplementation(async (cmd) =>
        cmd instanceof CreateClientCommand ? { data: { id: 'c-new' } } : undefined,
      ),
    };
    prisma.client.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.reservation.create.mockResolvedValue(created);
    handler = new CreateReservationHandler(prisma as any, queryBus as any, commandBus as any);
  });

  it('crea la reservación para un cliente existente (buscado por teléfono activo)', async () => {
    const result = await handler.execute(build());

    expect(prisma.client.findFirst).toHaveBeenCalledWith({
      where: { phoneNumber: '55512345', status: true },
    });
    expect(commandBus.execute).not.toHaveBeenCalled();
    expect(prisma.reservation.create).toHaveBeenCalledWith({
      data: {
        clientId: 'c1',
        hour: new Date('2026-10-20T18:30:00.000Z'),
        reservationDate,
        reservationResource: 'CANCHA_1',
        status: 'PENDIENTE',
        reservedHours: 1,
        totalReservation: 150,
      },
    });
    expect(result).toEqual({
      statusCode: 201,
      message: 'Reservación creada satisfactoriamente.',
      data: created,
    });
  });

  it('si el cliente no existe lo crea y usa su nuevo id', async () => {
    prisma.client.findFirst.mockResolvedValue(null);

    await handler.execute(build());

    const sent = commandBus.execute.mock.calls[0][0];
    expect(sent).toBeInstanceOf(CreateClientCommand);
    expect(sent.data).toBe(client);
    expect(prisma.reservation.create.mock.calls[0][0].data.clientId).toBe('c-new');
  });

  it('valida disponibilidad con fecha, recurso y hora antes de crear', async () => {
    await handler.execute(build());

    const sent = queryBus.execute.mock.calls[0][0];
    expect(sent).toBeInstanceOf(GetReservationCheckoutAvailableQuery);
    expect(sent.filters).toEqual({
      reservationDate,
      reservationResource: 'CANCHA_1',
      hour: '18:30',
    });
  });

  it('lanza ConflictException si el horario ya está ocupado y no crea nada', async () => {
    queryBus.execute.mockResolvedValue({ data: [{ id: 'otra' }] });

    await expect(handler.execute(build())).rejects.toThrow(ConflictException);
    await expect(handler.execute(build())).rejects.toThrow(/no está disponible/);
    expect(prisma.reservation.create).not.toHaveBeenCalled();
    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('registra el abono inicial cuando viene en la solicitud', async () => {
    await handler.execute(build({ deposit: { amount: 50 } }));

    const depositCommand = commandBus.execute.mock.calls
      .map(([cmd]) => cmd)
      .find((cmd) => cmd instanceof CreateReservationDepositCommand);
    expect(depositCommand!.data).toEqual({ reservationId: 'res-1', amount: 50 });
  });

  it('no registra abono cuando no viene en la solicitud', async () => {
    await handler.execute(build());

    const hasDeposit = commandBus.execute.mock.calls.some(
      ([cmd]) => cmd instanceof CreateReservationDepositCommand,
    );
    expect(hasDeposit).toBe(false);
  });

  it('relanza errores inesperados', async () => {
    prisma.reservation.create.mockRejectedValue(new Error('db caída'));

    await expect(handler.execute(build())).rejects.toThrow('db caída');
  });
});
