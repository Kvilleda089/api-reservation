import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { handlePrismaError } from '../helpers/prisma-error.handler';

const prismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError('prisma error', {
    code,
    clientVersion: 'test',
  });

describe('handlePrismaError', () => {
  const MSG = 'Error al guardar';

  it('P2000 -> BadRequestException (valor demasiado largo)', () => {
    expect(() => handlePrismaError(prismaError('P2000'), MSG)).toThrow(
      BadRequestException,
    );
    expect(() => handlePrismaError(prismaError('P2000'), MSG)).toThrow(
      /demasiado largo/,
    );
  });

  it('P2002 -> ConflictException (valor duplicado)', () => {
    expect(() => handlePrismaError(prismaError('P2002'), MSG)).toThrow(
      ConflictException,
    );
    expect(() => handlePrismaError(prismaError('P2002'), MSG)).toThrow(
      `${MSG}: el valor ya existe.`,
    );
  });

  it('P2003 -> BadRequestException (referencia inválida)', () => {
    expect(() => handlePrismaError(prismaError('P2003'), MSG)).toThrow(
      BadRequestException,
    );
    expect(() => handlePrismaError(prismaError('P2003'), MSG)).toThrow(
      /referencia inválida/,
    );
  });

  it('P2025 -> NotFoundException (registro inexistente)', () => {
    expect(() => handlePrismaError(prismaError('P2025'), MSG)).toThrow(
      NotFoundException,
    );
    expect(() => handlePrismaError(prismaError('P2025'), MSG)).toThrow(
      /el registro no existe/,
    );
  });

  it('un código de Prisma no mapeado se relanza tal cual', () => {
    const error = prismaError('P9999');
    expect(() => handlePrismaError(error, MSG)).toThrow(error);
  });

  it('un error que no es de Prisma se relanza tal cual', () => {
    const error = new Error('boom');
    expect(() => handlePrismaError(error, MSG)).toThrow(error);
  });

  it('las HttpException de Nest pasan sin modificarse', () => {
    const error = new NotFoundException('no existe');
    expect(() => handlePrismaError(error, MSG)).toThrow(error);
  });

  it('un valor que no es Error también se relanza', () => {
    expect(() => handlePrismaError('texto', MSG)).toThrow();
  });
});
