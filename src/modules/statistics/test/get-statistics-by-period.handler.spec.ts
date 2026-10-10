import { BadRequestException } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { createPrismaMock, PrismaMock } from 'test/helpers/prisma.mock';
import { GetStatisticsByPeriodHandler } from '../query/handler/get-statistics-by-period.handler';
import { GetStatisticsByPeriodQuery } from '../query/impl/get-statistics-by-period.query';

jest.mock('src/database/prisma.service', () => ({
  PrismaService: class {},
}));

describe('GetStatisticsByPeriodHandler', () => {
  let prisma: PrismaMock;
  let handler: GetStatisticsByPeriodHandler;

  const day = (d: string) => new Date(`${d}T00:00:00.000Z`);
  const reservations = [
    {
      reservationDate: day('2026-10-14'),
      status: 'CONFIRMADA',
      reservationResource: 'CANCHA_1',
      totalReservation: '200.00',
      deposits: [{ amount: '100.00' }],
    },
    {
      reservationDate: day('2026-10-14'),
      status: 'PENDIENTE',
      reservationResource: 'CANCHA_2',
      totalReservation: '150.00',
      deposits: [],
    },
    {
      reservationDate: day('2026-10-12'),
      status: 'CANCELADA',
      reservationResource: 'SALON',
      totalReservation: '300.00',
      deposits: [{ amount: '50.00' }, { amount: '25.50' }],
    },
    {
      reservationDate: day('2026-10-13'),
      status: 'FINALIZADA',
      reservationResource: 'CANCHA_1',
      totalReservation: '100.00',
      deposits: [{ amount: '100.00' }],
    },
  ];

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-14T12:00:00.000Z'));
    prisma = createPrismaMock();
    prisma.reservation.findMany.mockResolvedValue(reservations);
    handler = new GetStatisticsByPeriodHandler(prisma as any);
  });

  afterEach(() => jest.useRealTimers());

  const run = (period: any) =>
    handler.execute(new GetStatisticsByPeriodQuery(period));

  describe('rangos de fechas', () => {
    it('week: de domingo a domingo siguiente', async () => {
      const result = await run('week');

      expect(result.range).toEqual({
        startDate: new Date('2026-10-11T00:00:00.000Z'),
        endDate: new Date('2026-10-18T00:00:00.000Z'),
      });
    });

    it('month: del 1 del mes al 1 del mes siguiente', async () => {
      const result = await run('month');

      expect(result.range).toEqual({
        startDate: new Date('2026-10-01T00:00:00.000Z'),
        endDate: new Date('2026-11-01T00:00:00.000Z'),
      });
    });

    it('year: del 1 de enero al 1 de enero siguiente', async () => {
      const result = await run('year');

      expect(result.range).toEqual({
        startDate: new Date('2026-01-01T00:00:00.000Z'),
        endDate: new Date('2027-01-01T00:00:00.000Z'),
      });
    });

    it('consulta reservaciones dentro de [start, end) incluyendo abonos', async () => {
      await run('week');

      expect(prisma.reservation.findMany).toHaveBeenCalledWith({
        where: {
          reservationDate: {
            gte: new Date('2026-10-11T00:00:00.000Z'),
            lt: new Date('2026-10-18T00:00:00.000Z'),
          },
        },
        include: { deposits: true },
      });
    });
  });

  describe('resumen', () => {
    it('cuenta reservaciones por estado', async () => {
      const { summary, period } = await run('week');

      expect(period).toBe('week');
      expect(summary).toMatchObject({
        totalReservations: 4,
        confirmedReservations: 1,
        pendingReservations: 1,
        cancelledReservations: 1,
        finalizedReservations: 1,
      });
    });

    it('suma el total facturado y el total de abonos', async () => {
      const { summary } = await run('week');

      expect(summary.totalRevenue).toBe(750);
      expect(summary.totalDeposits).toBe(275.5);
    });

    it('cuenta reservaciones por recurso', async () => {
      const result = await run('week');

      expect(result.reservationsByResource).toEqual({
        CANCHA_1: 2,
        CANCHA_2: 1,
        SALON: 1,
      });
    });

    it('sin reservaciones todo queda en cero', async () => {
      prisma.reservation.findMany.mockResolvedValue([]);

      const { summary, reservationsByResource } = await run('month');

      expect(summary).toEqual({
        totalReservations: 0,
        confirmedReservations: 0,
        pendingReservations: 0,
        cancelledReservations: 0,
        finalizedReservations: 0,
        totalRevenue: 0,
        totalDeposits: 0,
      });
      expect(reservationsByResource).toEqual({
        CANCHA_1: 0,
        CANCHA_2: 0,
        SALON: 0,
      });
    });
  });

  describe('línea de tiempo', () => {
    it('week: una entrada por día (11 al 17) con su conteo', async () => {
      const { reservationsTimeline } = await run('week');

      expect(reservationsTimeline).toEqual([
        { label: '11', reservations: 0 },
        { label: '12', reservations: 1 },
        { label: '13', reservations: 1 },
        { label: '14', reservations: 2 },
        { label: '15', reservations: 0 },
        { label: '16', reservations: 0 },
        { label: '17', reservations: 0 },
      ]);
    });

    it('month: una entrada por cada día de octubre (31)', async () => {
      const { reservationsTimeline } = await run('month');

      expect(reservationsTimeline).toHaveLength(31);
      expect(reservationsTimeline[0]).toEqual({ label: '01', reservations: 0 });
      expect(reservationsTimeline[13]).toEqual({
        label: '14',
        reservations: 2,
      });
      expect(reservationsTimeline[30].label).toBe('31');
    });

    it('year: una entrada por mes con abreviatura en español', async () => {
      const { reservationsTimeline } = await run('year');

      expect(reservationsTimeline).toHaveLength(12);
      expect(reservationsTimeline[0].label).toBe('Ene');
      expect(reservationsTimeline[8].label).toBe('Sep');
      expect(reservationsTimeline[9]).toEqual({
        label: 'Oct',
        reservations: 4,
      });
      expect(reservationsTimeline[11].label).toBe('Dic');
    });
  });

  it('traduce errores de Prisma (P2003 -> BadRequestException)', async () => {
    prisma.reservation.findMany.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('x', {
        code: 'P2003',
        clientVersion: 'test',
      }),
    );

    await expect(run('week')).rejects.toThrow(BadRequestException);
  });

  it('relanza errores inesperados', async () => {
    prisma.reservation.findMany.mockRejectedValue(new Error('db caída'));

    await expect(run('week')).rejects.toThrow('db caída');
  });
});
