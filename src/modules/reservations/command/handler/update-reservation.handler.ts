import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { UpdateReservationCommand } from "../impl/update-reservation.command";
import { PrismaService } from "src/database/prisma.service";
import { ConflictException, Logger, NotFoundException } from "@nestjs/common";
import { UpdateReservationDto } from "../../domain/dto/update-reservaton.dto";
import { Reservation } from "src/generated/prisma/client";
import { handlePrismaError } from "src/database/helpers/prisma-error.handler";
import { ResponseDto } from "src/common/dto";
import { GetReservationAvailableDto } from "../../domain/dto/get-reservation-available.dto";
import { GetReservationAvailableQuery } from "../../query/query/get-reservation-checkout-available.query";
import { ReservationResourceEnum, StatusReservationEnum } from "../../domain/enum";

@CommandHandler(UpdateReservationCommand)
export class UpdateReservationHandler implements ICommandHandler<UpdateReservationCommand> {

    private readonly logger = new Logger('GetReservationCheckoutAvailableHandler')

    constructor(
        private readonly prismaService: PrismaService,
        private readonly queryBus: QueryBus,
    ) { }

    async execute(command: UpdateReservationCommand): Promise<ResponseDto<Reservation>> {
        try {
            const { id, data } = command;
            const result = await this.updateReservationByClientId(id, data);

            return {
                statusCode: 200,
                message: 'Se ha actualizado correctamente el registro',
                data: result,
            }

        } catch (error) {
            this.logger.error(`Error to created Client error: ${error}`);
            handlePrismaError(
                error,
                `Hubo un error al crear reservación`
            )
        }
    }

    private async updateReservationByClientId(id: string, data: UpdateReservationDto): Promise<Reservation> {
        const reservation = await this.prismaService.reservation.findFirst({
            where: {
                id: id
            }
        })

        if (!reservation) {
            throw new NotFoundException(`No se ha encontrado reservación con el ID:  ${id}`)
        }

        const reservationDate =
            data.reservationDate ?? reservation.reservationDate;

        const reservationResource =
            data.reservationResource ?? reservation.reservationResource as ReservationResourceEnum;

        const hourString =
            data.hour ??
            `${reservation.hour.getUTCHours().toString().padStart(2, '0')}:${reservation.hour.getUTCMinutes().toString().padStart(2, '0')}`;


        const filters: GetReservationAvailableDto = {
            reservationDate: reservationDate!,
            reservationResource: reservationResource,
            hour: hourString,
        }

        const hasAvailabilityChange =
            data.reservationDate !== undefined ||
            data.reservationResource !== undefined ||
            data.hour !== undefined ||
            data.reservedHours !== undefined;

        //Antes de actualizar, si es diferente a CANCELADA, hasAvailabilityChange 
        if (hasAvailabilityChange &&
            data.status !== StatusReservationEnum.CANCELADA) {
            const reservationAvailable = await this.queryBus.execute(
                new GetReservationAvailableQuery(filters)
            );

            if (reservationAvailable.data.length > 0) {
                throw new ConflictException(
                    'La reservación no está disponible para la fecha, hora y recurso seleccionados.'
                );
            }
        }

        const [hours, minutes] = hourString!.split(':');

        const hour = new Date(reservationDate!);

        hour.setUTCHours(
            Number(hours),
            Number(minutes),
            0,
            0,
        );

        const resultUpdate = await this.prismaService.reservation.update({
            where: {
                id: id
            },
            data: {
                ...data,
                reservationDate,
                reservationResource,
                hour,
            }
        })


        return resultUpdate;
    }
}