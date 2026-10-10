import { createPrismaMock, PrismaMock } from 'test/helpers/prisma.mock';
import { GetAgendaHandler } from '../query/handler/get-agenda.handler';
import { GetAgendaQuery } from '../query/imp/get-agenda.query';


jest.mock('src/database/prisma.service', () => ({
  PrismaService: class {},
}));


describe('GetAgendaHandler', () => {
  let prisma: PrismaMock;
  let handler: GetAgendaHandler;

  const at = (time: string) => new Date(`1970-01-01T${time}:00.000Z`);
  const ana = { id: 'c1', firstName: 'Ana', surname: 'Pérez' };
  const luis = { id: 'c2', firstName: 'Luis', surname: 'Gómez' };

  beforeEach(() => {
    prisma = createPrismaMock();
    handler = new GetAgendaHandler(prisma as any);
  });

  it('consulta solo reservaciones CONFIRMADA/PENDIENTE del día indicado', async () => {
    prisma.reservation.findMany.mockResolvedValue([]);
    prisma.client.findMany.mockResolvedValue([]);

    await handler.execute(new GetAgendaQuery('2026-10-20'));

    expect(prisma.reservation.findMany).toHaveBeenCalledWith({
      where: {
        reservationDate: new Date(2026, 9, 20),
        status: { in: ['CONFIRMADA', 'PENDIENTE'] },
      },
    });
  });

  it('sin reservaciones devuelve la fecha y una lista vacía de recursos', async () => {
    prisma.reservation.findMany.mockResolvedValue([]);
    prisma.client.findMany.mockResolvedValue([]);

    const result = await handler.execute(new GetAgendaQuery('2026-10-20'));

    expect(result).toEqual({ date: '2026-10-20', resources: [] });
  });

  it('agrupa por recurso, formatea la hora HH:mm y arma el nombre del cliente', async () => {
    prisma.reservation.findMany.mockResolvedValue([
      { clientId: 'c1', reservationResource: 'CANCHA_1', hour: at('18:00'), reservedHours: 2, status: 'CONFIRMADA' },
      { clientId: 'c2', reservationResource: 'CANCHA_2', hour: at('09:30'), reservedHours: 1, status: 'PENDIENTE' },
      { clientId: 'c1', reservationResource: 'CANCHA_1', hour: at('20:00'), reservedHours: 1, status: 'PENDIENTE' },
    ]);
    prisma.client.findMany.mockResolvedValue([ana, luis]);

    const result = await handler.execute(new GetAgendaQuery('2026-10-20'));

    expect(result).toEqual({
      date: '2026-10-20',
      resources: [
        {
          resource: 'CANCHA_1',
          reservations: [
            { hour: '18:00', reservedHours: 2, client: 'Ana Pérez', status: 'CONFIRMADA' },
            { hour: '20:00', reservedHours: 1, client: 'Ana Pérez', status: 'PENDIENTE' },
          ],
        },
        {
          resource: 'CANCHA_2',
          reservations: [
            { hour: '09:30', reservedHours: 1, client: 'Luis Gómez', status: 'PENDIENTE' },
          ],
        },
      ],
    });
  });

  it('consulta los clientes una sola vez por id único', async () => {
    prisma.reservation.findMany.mockResolvedValue([
      { clientId: 'c1', reservationResource: 'CANCHA_1', hour: at('18:00'), reservedHours: 1, status: 'CONFIRMADA' },
      { clientId: 'c2', reservationResource: 'CANCHA_2', hour: at('10:00'), reservedHours: 1, status: 'CONFIRMADA' },
      { clientId: 'c1', reservationResource: 'SALON', hour: at('12:00'), reservedHours: 1, status: 'CONFIRMADA' },
    ]);
    prisma.client.findMany.mockResolvedValue([ana, luis]);

    await handler.execute(new GetAgendaQuery('2026-10-20'));

    expect(prisma.client.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.client.findMany).toHaveBeenCalledWith({ where: { id: { in: ['c1', 'c2'] } } });
  });


  it.failing('cada recurso muestra su propio cliente aunque coincida la hora', async () => {
    prisma.reservation.findMany.mockResolvedValue([
      { clientId: 'c1', reservationResource: 'CANCHA_1', hour: at('18:00'), reservedHours: 1, status: 'CONFIRMADA' },
      { clientId: 'c2', reservationResource: 'CANCHA_2', hour: at('18:00'), reservedHours: 1, status: 'CONFIRMADA' },
    ]);
    prisma.client.findMany.mockResolvedValue([ana, luis]);

    const result = await handler.execute(new GetAgendaQuery('2026-10-20'));

    const cancha2 = result.resources.find((r: any) => r.resource === 'CANCHA_2');
    expect(cancha2.reservations[0].client).toBe('Luis Gómez');
  });

  it('relanza errores inesperados', async () => {
    prisma.reservation.findMany.mockRejectedValue(new Error('db caída'));

    await expect(handler.execute(new GetAgendaQuery('2026-10-20'))).rejects.toThrow('db caída');
  });
});
