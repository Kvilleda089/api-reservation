import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllReservationQuery } from "../query/get-all-reservation.query";
import { Logger } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { PaginationDto, ResponseDto } from "src/common/dto";
import { Reservation } from "src/generated/prisma/client";
import { handlePrismaError } from "src/database/helpers/prisma-error.handler";


@QueryHandler(GetAllReservationQuery)
export class GetAllReservationHandler implements IQueryHandler<GetAllReservationQuery> {

    private readonly logger = new Logger('GetReservationCheckoutAvailableHandler')

    constructor(
        private readonly prismaService: PrismaService,

    ) { }


    async execute(query: GetAllReservationQuery): Promise<ResponseDto<Reservation[]>> {

        try {
            const { page = 1, limit = 10 } = query.pagination;
            const totalRecords = await this.prismaService.client.count();

            this.logger.log(`Total de registros encontrados ${totalRecords}`)
            const lastPage = Math.ceil(totalRecords / limit);

            const reservations = await this.prismaService.reservation.findMany({
                skip: (page - 1) * limit,
                take: limit,
            });


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

    };
}