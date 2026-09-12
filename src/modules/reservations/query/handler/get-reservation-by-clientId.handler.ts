import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetReservationByClientIdQuery } from "../imp/get-reservation-by-clientId.query";
import { PrismaService } from "src/database/prisma.service";
import { Logger, NotFoundException } from "@nestjs/common";
import { PaginationDto, ResponseDto } from "src/common/dto";
import { Reservation } from "src/generated/prisma/client";
import { handlePrismaError } from "src/database/helpers/prisma-error.handler";


@QueryHandler(GetReservationByClientIdQuery)
export class GetReservationByClientIdHandler implements IQueryHandler<GetReservationByClientIdQuery> {

    private readonly logger = new Logger('GetReservationCheckoutAvailableHandler')

    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async execute(query: GetReservationByClientIdQuery): Promise<ResponseDto<Reservation[]>> {
        try {
            const { page = 1, limit = 10 } = query.paginationDto;
            const totalRecords = await this.prismaService.client.count();

            this.logger.log(`Total de registros encontrados ${totalRecords}`)
            const lastPage = Math.ceil(totalRecords / limit);

            const reservations = await this.prismaService.reservation.findMany({
                where: {
                    clientId: query.clientId,
                },
                skip: (page - 1) * limit,
                take: limit,
            });

            if(reservations.length ===0) {
                throw new NotFoundException(`No se encontrarón registros con el cliente ${query.clientId}`)
            }

            return {
                statusCode: 200,
                data: reservations,
                message: 'Resultados obtenidos',
                pagination: {
                    page,
                    limit,
                    totalRecords,
                    lastPage,
                },
            };
        } catch (error) {
            this.logger.error(`Error to created Client error: ${error}`);
            handlePrismaError(
                error,
                `Hubo un error al crear reservación`
            )
        }
    }


}