import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetReservationByIdQuery } from "../imp/get-reservation-by-id.query";
import { Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { Reservation } from "src/generated/prisma/client";
import { handlePrismaError } from "src/database/helpers/prisma-error.handler";
import { ResponseDto } from "src/common/dto";


@QueryHandler(GetReservationByIdQuery)
export class GetReservationByIdHandler implements IQueryHandler<GetReservationByIdQuery> {


    private readonly logger = new Logger(`${GetReservationByIdHandler.name}`);

    constructor(
        private readonly prismaService: PrismaService,
    ) { }


    async execute(query: GetReservationByIdQuery): Promise<ResponseDto<Reservation>> {
        try {

            const { id } = query;
            const result = await this.getReservationById(id);

            return {
                statusCode: 200,
                message: 'Datos encontrados correctamente',
                data: result,
            }

        } catch (error) {
            this.logger.error(`Error to created Client error: ${error}`);
            handlePrismaError(
                error,
                `Hubo un error al crear reservación`
            )
        }
    };

    private async getReservationById(id: string): Promise<Reservation> {
        this.logger.log(`Buscando información de reservación con ID: ${id}`)
        const reservation = await this.prismaService.reservation.findFirst({
            where: {
                id: id
            },
            include: {
                client: true,
                deposits: true,
            }
        });


        if (!reservation) {
            this.logger.log(`No se ha encontrado información con el ID: ${id}`)
            throw new NotFoundException(`No se ha encontrado información con el ID: ${id}`)
        }

        return reservation;
    }
}