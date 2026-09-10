import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOneReservationDepositByIdQuery } from '../impl/get-one-reservation-deposit-byId.query';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ReservationDeposit } from 'src/generated/prisma/client';
import { ResponseDto } from 'src/common/dto';
import { handlePrismaError } from 'src/database/helpers/prisma-error.handler';

@QueryHandler(GetOneReservationDepositByIdQuery)
export class GetOneReservationDepositHandler implements IQueryHandler<GetOneReservationDepositByIdQuery> {
    private readonly logger = new Logger(`Execute ${GetOneReservationDepositHandler.name}`);

    constructor(private readonly prismaService: PrismaService) { }

   async execute(query: GetOneReservationDepositByIdQuery): Promise<ResponseDto<ReservationDeposit[]>> {
        try {
            const { id, reservationId} =query;
            const result = await this.getOneReservationByIdOrReservationId(id!, reservationId!);

            return {
                statusCode: 200,
                message: 'Resultados encontrados',
                data: result
            }
        } catch (error) {
            this.logger.error(`Error to created Client error: ${error}`);
            handlePrismaError(
                error,
                `Hubo un error al crear reservación`
            )
        }
    }

    private async getOneReservationByIdOrReservationId(id: string, reservationId: string): Promise<ReservationDeposit[]> {
        const reservationDeposits = await this.prismaService.reservationDeposit.findMany({
            where: {
                ...(id && { id }),
                ...(reservationId && { reservationId })
            }
        })

        if (!reservationDeposits.length) {
            throw new NotFoundException('No se encontró información de depósitos con los parámetros enviados',);
        }

        return reservationDeposits;

    }


}
