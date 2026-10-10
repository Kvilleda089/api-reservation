const fns = <T extends string>(...names: T[]) =>
  Object.fromEntries(names.map((n) => [n, jest.fn()])) as Record<T, jest.Mock>;

/** Mock mínimo de PrismaService con los métodos que usa el proyecto. */
export const createPrismaMock = () => ({
  employee: fns('findFirst', 'findMany', 'count', 'create', 'update'),
  client: fns('findFirst', 'findMany', 'count', 'create', 'update'),
  reservation: fns('findFirst', 'findMany', 'count', 'create', 'update'),
  reservationDeposit: fns('findMany', 'count', 'aggregate', 'create'),
  userSession: fns('findUnique', 'create', 'updateMany'),
});

export type PrismaMock = ReturnType<typeof createPrismaMock>;
