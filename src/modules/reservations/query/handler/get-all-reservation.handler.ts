import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllReservationQuery } from '../imp/get-all-reservation.query';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { PaginationDto, ResponseDto } from 'src/common/dto';
import { Reservation } from 'src/generated/prisma/client';
import { handlePrismaError } from 'src/database/helpers/prisma-error.handler';
import { buildPaginationResponse } from "src/common/utils/pagination-response.helper";

@QueryHandler(GetAllReservationQuery)
export class GetAllReservationHandler
    implements IQueryHandler<GetAllReservationQuery> {

    private readonly logger = new Logger(
        GetAllReservationHandler.name
    );

    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async execute(query: GetAllReservationQuery): Promise<ResponseDto<Reservation[]>> {
        try {

            const result = await this.getAllReservations(
                query.pagination,
            );

            return buildPaginationResponse(
                result.reservations,
                result.pagination,
            );

        } catch (error) {

            this.logger.error(
                `Error al obtener las reservaciones`,
                error,
            );

            handlePrismaError(
                error,
                'Hubo un error al obtener las reservaciones',
            );
        }
    }

    private async getAllReservations(paginationDto: PaginationDto,) {
        const {page = 1, limit = 10, } = paginationDto;

        const [totalRecords, reservations] = await Promise.all([
            this.prismaService.reservation.count(),

            this.prismaService.reservation.findMany({
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    client: true,
                },
            }),
        ]);

        this.logger.log(
            `Total de registros encontrados: ${totalRecords}`
        );

        return {
            reservations,
            pagination: {
                page,
                limit,
                totalRecords,
            },
        };
    }
}