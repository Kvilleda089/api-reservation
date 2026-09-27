import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetReservationByClientIdQuery } from "../imp/get-reservation-by-clientId.query";
import { PrismaService } from "src/database/prisma.service";
import { Logger, NotFoundException } from "@nestjs/common";
import { PaginationDto, ResponseDto } from "src/common/dto";
import { Reservation } from "src/generated/prisma/client";
import { handlePrismaError } from "src/database/helpers/prisma-error.handler";
import { buildPaginationResponse } from "src/common/utils/pagination-response.helper";


@QueryHandler(GetReservationByClientIdQuery)
export class GetReservationByClientIdHandler implements IQueryHandler<GetReservationByClientIdQuery> {

    private readonly logger = new Logger(`${GetReservationByClientIdHandler.name}`)

    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async execute(query: GetReservationByClientIdQuery): Promise<ResponseDto<Reservation[]>> {
        try {

            const result = await this.getReservationsByClient(
                query.clientId,
                query.paginationDto,
            );

        
            return buildPaginationResponse(
                result.reservations,
                result.pagination
            )
        } catch (error) {
            this.logger.error(`Error to created Client error: ${error}`);
            handlePrismaError(
                error,
                `Hubo un error al crear reservación`
            )
        }
    };

    private async getReservationsByClient(
        clientId: string,
        paginationDto: PaginationDto,
    ) {

        this.logger.log(`Buscando información con el ClientId: ${clientId}`)
        const { page = 1, limit = 10 } = paginationDto;

        const where = {
            clientId,
        };

        const [totalRecords, reservations] = await Promise.all([
            this.prismaService.reservation.count({
                where,
            }),

            

            this.prismaService.reservation.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);

        this.logger.log(`Total de registros encontrados para el ClientId: ${reservations.length}`)
        if (reservations.length === 0) {
            this.logger.log(`No se encontrarón reservaciones con el ClientId ${reservations.length}`)
            throw new NotFoundException(
                `No se encontraron registros con el ClientId ${clientId}`
            );
        }

        return {
            reservations,
            pagination: {
                page,
                limit,
                totalRecords,
                lastPage: Math.ceil(totalRecords / limit),

            }

        };
    }

}