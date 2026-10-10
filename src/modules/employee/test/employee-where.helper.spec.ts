import { buildEmployeeWhere } from "../common/helper/employee-where.helper";

describe('buildEmployeeWhere', () => {
  it('sin filtros devuelve un objeto vacío', () => {
    expect(buildEmployeeWhere({} as any)).toEqual({});
  });

  it.each(['firstName', 'middleName', 'surname', 'secondSurname', 'email', 'username'])(
    'filtra %s con contains e insensible a mayúsculas',
    (field) => {
      expect(buildEmployeeWhere({ [field]: 'abc' } as any)).toEqual({
        [field]: { contains: 'abc', mode: 'insensitive' },
      });
    },
  );

  it('phoneNumber usa contains sin mode', () => {
    expect(buildEmployeeWhere({ phoneNumber: '5555' } as any)).toEqual({
      phoneNumber: { contains: '5555' },
    });
  });

  it('role se compara por igualdad exacta', () => {
    expect(buildEmployeeWhere({ role: 'ADMINISTRATOR' } as any)).toEqual({ role: 'ADMINISTRATOR' });
  });

  it('status false se incluye (no se confunde con "sin filtro")', () => {
    expect(buildEmployeeWhere({ status: false } as any)).toEqual({ status: false });
    expect(buildEmployeeWhere({ status: true } as any)).toEqual({ status: true });
  });

  it('status undefined no agrega la condición', () => {
    expect(buildEmployeeWhere({ status: undefined } as any)).toEqual({});
  });

  it('ignora strings vacíos', () => {
    expect(buildEmployeeWhere({ firstName: '', email: '' } as any)).toEqual({});
  });

  it('combina varios filtros', () => {
    expect(
      buildEmployeeWhere({ firstName: 'ana', role: 'RECEPTIONIST', status: true } as any),
    ).toEqual({
      firstName: { contains: 'ana', mode: 'insensitive' },
      role: 'RECEPTIONIST',
      status: true,
    });
  });
});
