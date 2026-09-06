import {
    BadRequestException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';

import { Prisma } from 'src/generated/prisma/client';

export function handlePrismaError(
    error: unknown,
    messageError: string,
): never {

    if (error instanceof Prisma.PrismaClientKnownRequestError) {

        switch (error.code) {

            case 'P2000':
                throw new BadRequestException(
                    `${messageError}: uno de los valores enviados es demasiado largo.`,
                );

            case 'P2002':
                throw new ConflictException(
                    `${messageError}: el valor ya existe.`,
                );

            case 'P2003':
                throw new BadRequestException(
                    `${messageError}: existe una referencia inválida.`,
                );

            case 'P2025':
                throw new NotFoundException(
                    `${messageError}: el registro no existe.`,
                );

            default:
                throw error;
        }
    }

    throw error;
}