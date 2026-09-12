import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import { CreateReservationCommand } from "../impl/create-reservation.command";
import { ConflictException, Logger } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { Reservation } from "src/generated/prisma/client";
import { handlePrismaError } from "src/database/helpers/prisma-error.handler";
import { ResponseDto } from "src/common/dto";
import { GetReservationCheckoutAvailableQuery } from "../../query/imp/get-reservation-checkout-available.query";
import { GetReservationAvailableDto } from "../../domain/dto/get-reservation-available.dto";
import { CreateReservationDataDto } from "../../domain/dto/create-reservation-data.dto";
import { CreateClientCommand } from "src/modules/clients/command/impl/create-client.command";
import { CreateReservationDepositCommand } from "src/modules/reservation-deposit/command/impl/create-reservation-deposit.command";
import { CreateReservationDepositDto } from "src/modules/reservation-deposit/domain/dto/create-reservation-deposit.dto";


@CommandHandler(CreateReservationCommand)
export class CreateReservationHandler implements ICommandHandler<CreateReservationCommand> {

    private readonly logger = new Logger(`${CreateReservationHandler.name}`)
    constructor(
        private readonly prismaService: PrismaService,
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,

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

    private async createReservation(data: CreateReservationDataDto): Promise<Reservation> {

        const { client, reservation, deposit } = data;
        let clientId: string;

        const clientResult = await this.prismaService.client.findFirst({
            where: {
                phoneNumber: client.phoneNumber,
                status: true,
            }
        })

        if (clientResult) {
            this.logger.log(`Cliente encontrado correctamente con el ID: ${clientResult.id}`)
            clientId = clientResult.id;
        } else {
            this.logger.log(`Cliente no encontrado. Se procede a crear cliente`)
            const clientCreate = await this.commandBus.execute(new CreateClientCommand(client));
            clientId = clientCreate.data.id;
        }

        const hour = new Date(reservation.reservationDate);
        const [hours, minutes] = reservation.hour.split(':');
        hour.setUTCHours(Number(hours), Number(minutes), 0, 0,);


        const filters: GetReservationAvailableDto = {
            reservationDate: reservation.reservationDate,
            reservationResource: reservation.reservationResource,
            hour: reservation.hour,
        }

        //Validamos si está disponible, si devuelve data[] disponible si devuelve 1, no esta disponbiel y no se crea. 
        const reservationAvailable = await this.queryBus.execute(
            new GetReservationCheckoutAvailableQuery(filters)
        );

        if (reservationAvailable.data.length > 0) {
            this.logger.log(`La reservación no está disponible para la fecha, hora y recurso seleccionados.`)
            throw new ConflictException(
                'La reservación no está disponible para la fecha, hora y recurso seleccionados.'
            );
        }

        const reservationResult = await this.prismaService.reservation.create({
            data: {
                clientId: clientId,
                hour: hour,
                reservationDate: reservation.reservationDate,
                reservationResource: reservation.reservationResource,
                status: reservation.status,
                reservedHours: reservation.reservedHours,
                totalReservation: reservation.totalReservation,
            },
        });

        //validamos si viene deposito, procedemos a la creación
        if (deposit) {
            const reservationDepositDto: CreateReservationDepositDto = {
                reservationId: reservationResult.id,
                amount: deposit.amount
            }
            await this.commandBus.execute(
                new CreateReservationDepositCommand(reservationDepositDto)
            )
        }
        return reservationResult;
    }
}