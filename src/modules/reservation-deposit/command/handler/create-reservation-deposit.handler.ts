import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateReservationDepositCommand } from "../impl/create-reservation-deposit.command";
import { BadRequestException, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { ReservationDeposit, ReservationStatus } from "src/generated/prisma/client";
import { NotFoundError } from "rxjs";
import { ResponseDto } from "src/common/dto";


@CommandHandler(CreateReservationDepositCommand)
export class CreateReservationDepositHandler implements ICommandHandler<CreateReservationDepositCommand> {

    private readonly logger = new Logger('CreateReservationHandler');

    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async execute(command: CreateReservationDepositCommand): Promise<ResponseDto<ReservationDeposit>> {
        const result = await this.createReservation(command);

        return {
            statusCode: 201,
            message: 'Se ingresado el abono correctamente',
            data: result,
        };
    }

    private async createReservation(data: CreateReservationDepositCommand): Promise<ReservationDeposit> {
        const { reservationId, amount } = data.data

        //buscaremos que exista la reservación y que no este cancelada
        const reservation = await this.prismaService.reservation.findFirst({
            where: {
                id: reservationId,
            },
        });

        //miramos si existe la reservación
        if (!reservation) {
            throw new NotFoundException(`Lo sentimos, no se ha encontrado una reservación con el ID: ${reservationId}`)
        }

        //validamos el estado de la reservación
        if (
            reservation.status === ReservationStatus.CANCELADA ||
            reservation.status === ReservationStatus.FINALIZADA
        ) {
            throw new BadRequestException(`Lo sentimos, no se puede registrar deposito, debido a que la reservación ya esta ${reservation.status}`)
        }

        //Validamos el total de depositos 
        const deposits = await this.prismaService.reservationDeposit.aggregate({
            where: {
                reservationId: reservation.id
            },
            _sum: {
                amount: true,
            }
        });

        const totalDeposited = Number(deposits._sum.amount ?? 0);

        //validamos cuanto quedará pendiente 
        const newTotalDeposited = totalDeposited + Number(amount);

        //validamos no superar el total de reservación
        if (
            newTotalDeposited >
            Number(reservation.totalReservation)
        ) {
            throw new BadRequestException(`El deposito no puede superar el total de la reservación. Saldo pendiente: Q${Number(reservation.totalReservation) - totalDeposited}`)
        }

        const reservationDesposit = await this.prismaService.reservationDeposit.create({
            data: {
                reservationId: reservationId!,
                amount: amount,
            }
        })

        //Por ultimo si se completo pago, actualizamos estado de reservación
        if( newTotalDeposited === Number(reservation.totalReservation)){
            await this.prismaService.reservation.update({
                where: {
                    id: reservationId,
                },
                data: {
                    status: ReservationStatus.FINALIZADA
                }
            })
        }

        return reservationDesposit
    }

}