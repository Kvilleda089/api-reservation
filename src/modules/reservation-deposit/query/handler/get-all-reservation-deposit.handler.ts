import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllReservationDepositQuery } from "../impl/get-all-reservation-deposit.query";
import { Logger } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { ResponseDto } from "src/common/dto";
import { ReservationDeposit } from "src/generated/prisma/client";
import { handlePrismaError } from "src/database/helpers/prisma-error.handler";


@QueryHandler(GetAllReservationDepositQuery)
export class GetAllReservationDepositHandler implements IQueryHandler<GetAllReservationDepositQuery> {


    private readonly logger = new Logger('GetAllReservationDepositHandler');
    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async execute(query: GetAllReservationDepositQuery): Promise<ResponseDto<ReservationDeposit[]>> {
        try {
            const { page = 1, limit = 10 } = query.paginationDto;
            const totalRecords = await this.prismaService.client.count();

            this.logger.log(`Total de registros encontrados ${totalRecords}`)
            const lastPage = Math.ceil(totalRecords / limit);

            const reservationDeposits = await this.prismaService.reservationDeposit.findMany({
                skip: (page - 1) * limit,
                take: limit,
            });


            return {
                statusCode: 200,
                data: reservationDeposits,
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