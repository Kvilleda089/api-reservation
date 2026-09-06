import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetReservationAvailableQuery } from "../query/get-reservation-checkout-available.query";
import { Logger } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { handlePrismaError } from "src/database/helpers/prisma-error.handler";
import { GetReservationAvailableDto } from "../../domain/dto/get-reservation-available.dto";
import { Reservation } from "src/generated/prisma/client";
import { StatusReservationEnum } from "../../domain/enum";
import { ResponseDto } from "src/common/dto";


@QueryHandler(GetReservationAvailableQuery)
export class GetReservationCheckoutAvailableHandler implements IQueryHandler<GetReservationAvailableQuery> {


    private readonly logger = new Logger('GetReservationCheckoutAvailableHandler')

    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async execute(query: GetReservationAvailableQuery): Promise<ResponseDto<Reservation[]>> {
        try {
            const result = await this.getReservationAvailable(query.filters);


            return {
                statusCode: 200,
                message: 'Resultados Obtenidos',
                data: result,
            }

        } catch (error) {
            this.logger.error(`Error to created Client error: ${error}`);
            handlePrismaError(
                error,
                `Error al crear Cliente`
            )
        }
    }

    private async getReservationAvailable(filters: GetReservationAvailableDto): Promise<Reservation[]> {
        const [hours, minutes] = filters.hour.split(':');

        const hour = new Date(filters.reservationDate);

        hour.setUTCHours(
            Number(hours),
            Number(minutes),
            0,
            0,
        );

        this.logger.log(`Buscando si esta disponible con los siguientes datos: ${JSON.stringify(filters)}`)
        const reservation = await this.prismaService.reservation.findMany({
            where: {
                reservationDate: filters.reservationDate,
                hour: hour,
                reservationResource: filters.reservationResource,
                status: {
                    not: StatusReservationEnum.CANCELADA
                },
            },
        });

        return reservation;
    }

}