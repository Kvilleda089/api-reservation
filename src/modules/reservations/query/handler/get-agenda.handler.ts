import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAgendaQuery } from "../imp/get-agenda.query";
import { Logger } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { StatusReservationEnum } from "../../domain/enum";
import { AgendaResponseDto, ReservationDto, ResourceDto } from "../../domain/dto/agenda-response.dto";
import { handlePrismaError } from "src/database/helpers/prisma-error.handler";


@QueryHandler(GetAgendaQuery)
export class GetAgendaHandler implements IQueryHandler<GetAgendaQuery> {

    private readonly logger = new Logger(`${GetAgendaHandler.name}`)

    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async execute(query: GetAgendaQuery): Promise<any> {
        try {
            const { date } = query;
            const [year, month, day] = date.split("-").map(Number);

            const dateFormat = new Date(year, month - 1, day);

            console.log(dateFormat);
            return this.getAgendaReservation(dateFormat);
        } catch (error) {
            this.logger.error(`Error to created Client error: ${error}`);
            handlePrismaError(
                error,
                `Hubo un error al crear reservación`
            )
        }
    }

    private async getAgendaReservation(date: Date) {

        const reservations: ReservationDto[] = [];
        const resources: ResourceDto[] = []
        const availableReservations = await this.prismaService.reservation.findMany({
            where: {
                reservationDate: date,
                status: StatusReservationEnum.CONFIRMADA
            }
        });

        const clientIds = [
            ...new Set(
                availableReservations.map(reservation => reservation.clientId)
            )
        ];

        const clients = await this.prismaService.client.findMany({
            where: {
                id: {
                    in: clientIds
                }
            }
        });

        for (const reservation of availableReservations) {
            const client = clients.find(
                client => client.id === reservation.clientId
            );
            reservations.push({
                hour: `${reservation.hour.getUTCHours().toString().padStart(2, "0")}:${reservation.hour.getUTCMinutes().toString().padStart(2, "0")}`,
                reservedHours: reservation.reservedHours,
                client: `${client?.firstName} ${client?.surname}`,
                status: reservation.status
            });
        };

        for (const reservation of availableReservations) {
            const resource = resources.find(
                resource => resource.resource === reservation.reservationResource
            );

            const reservationDto = reservations.find(
                item => item.hour === `${reservation.hour.getUTCHours().toString().padStart(2, "0")}:${reservation.hour.getUTCMinutes().toString().padStart(2, "0")}`
            );

            if (!reservationDto) {
                continue
            }

            if (resource) {
                resource.reservations.push(reservationDto)
            } else {
                resources.push({
                    resource: reservation.reservationResource,
                    reservations: [reservationDto]
                });
            }

        };

        const agendaResponse: AgendaResponseDto = {
            date: date.toISOString().split("T")[0],
            resources: resources,
        }

        return agendaResponse;
    }
}