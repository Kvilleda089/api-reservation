import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from 'src/common/enum/role.enum';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { RolesGuard } from '../guard';

describe('RolesGuard', () => {
  const handler = () => undefined;
  class FakeController {}

  let reflector: { getAllAndOverride: jest.Mock };
  let guard: RolesGuard;

  const contextWith = (user: unknown) =>
    ({
      getHandler: () => handler,
      getClass: () => FakeController,
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('consulta los roles en el método y en la clase usando ROLES_KEY', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    guard.canActivate(contextWith({ role: RoleEnum.RECEPTIONIST }));

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [handler, FakeController]);
  });

  it('permite el acceso cuando la ruta no exige roles', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(contextWith({ role: RoleEnum.CLEANING_STAFF }))).toBe(true);
  });

  it('permite el acceso cuando el rol del usuario está en la lista', () => {
    reflector.getAllAndOverride.mockReturnValue([RoleEnum.SUPER_ADMINISTRATOR, RoleEnum.ADMINISTRATOR]);

    expect(guard.canActivate(contextWith({ role: RoleEnum.ADMINISTRATOR }))).toBe(true);
  });

  it('lanza ForbiddenException cuando el rol no está permitido', () => {
    reflector.getAllAndOverride.mockReturnValue([RoleEnum.SUPER_ADMINISTRATOR]);

    expect(() => guard.canActivate(contextWith({ role: RoleEnum.RECEPTIONIST }))).toThrow(
      ForbiddenException,
    );
    expect(() => guard.canActivate(contextWith({ role: RoleEnum.RECEPTIONIST }))).toThrow(
      /no cuenta con los permisos adecuados/,
    );
  });
});
