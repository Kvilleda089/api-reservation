import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { CreateReservationCommand } from "../impl/create-reservation.command";
import { ConflictException, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { CreateReservationDto } from "../../domain/dto/create-reservation.dto";
import { Reservation } from "src/generated/prisma/client";
import { handlePrismaError } from "src/database/helpers/prisma-error.handler";
import { ResponseDto } from "src/common/dto";
import { GetReservationCheckoutAvailableQuery } from "../../query/imp/get-reservation-checkout-available.query";
import { GetReservationAvailableDto } from "../../domain/dto/get-reservation-available.dto";


@CommandHandler(CreateReservationCommand)
export class CreateReservationHandler implements ICommandHandler<CreateReservationCommand> {

    private readonly logger = new Logger('Creación Reservación')
    constructor(
        private readonly prismaService: PrismaService,
        private readonly queryBus: QueryBus,

    ) { }


    async execute(command: CreateReservationCommand): Promise<ResponseDto<Reservation>> {
        try {
            const result = await this.createReservation(command.data);

            return {
                statusCode: 201,
                message: 'Reservación creada satisfactoriamente.',
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

    private async createReservation(data: CreateReservationDto): Promise<Reservation> {
        const client = await this.prismaService.client.findFirst({
            where: {
                id: data.clientId,
                status: true,
            }
        })

        const hour = new Date(data.reservationDate);
        const [hours, minutes] = data.hour.split(':');
        hour.setUTCHours(Number(hours), Number(minutes), 0, 0,);

        if (!client) {
            throw new NotFoundException(`Ocurrió un error al crear reservación, cliente no existe. Validar datos o intentar nuevamente`)
        }

        const filters: GetReservationAvailableDto = {
            reservationDate: data.reservationDate,
            reservationResource: data.reservationResource,
            hour: data.hour,
        }

        //Validamos si está disponible, si devuelve data[] disponible si devuelve 1, no esta disponbiel y no se crea. 
        const reservationAvailable = await this.queryBus.execute(
            new GetReservationCheckoutAvailableQuery(filters)
        );

        if (reservationAvailable.data.length > 0) {
            throw new ConflictException(
                'La reservación no está disponible para la fecha, hora y recurso seleccionados.'
            );
        }

        const reservationResult = await this.prismaService.reservation.create({
            data: {
                clientId: data.clientId,
                hour: hour,
                reservationDate: data.reservationDate,
                reservationResource: data.reservationResource,
                status: data.status,
                reservedHours: data.reservedHours,
                totalReservation: data.totalReservation,
            },
        });

        return reservationResult;
    }
}