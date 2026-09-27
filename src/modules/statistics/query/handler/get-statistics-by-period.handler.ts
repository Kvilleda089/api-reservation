import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetStatisticsByPeriodQuery } from "../impl/get-statistics-by-period.query";
import { PrismaService } from "src/database/prisma.service";
import { Logger } from "@nestjs/common";
import { StatisticsPeriod } from "../../domain/type/statistics-periodo";
import { handlePrismaError } from "src/database/helpers/prisma-error.handler";
import { StatisticsResponseDto, StatisticsTimelineDto } from "../../domain/dto/statistics-response.dto";

@QueryHandler(GetStatisticsByPeriodQuery)
export class GetStatisticsByPeriodHandler implements IQueryHandler<GetStatisticsByPeriodQuery> {

    private readonly logger = new Logger(`${GetStatisticsByPeriodHandler.name}`);

    constructor(
        private readonly prismaService: PrismaService,
    ) {}

    async execute(
        query: GetStatisticsByPeriodQuery,
    ): Promise<StatisticsResponseDto> {
        try {
            return await this.getStatisticsByPeriod(query.period);
        } catch (error) {
            this.logger.error(
                `Error al querer obtener estadistica ${error}`,
            );

            handlePrismaError(
                error,
                `Error al querer obtener estadistica`,
            );
        }
    }

    private async getStatisticsByPeriod(
        period: StatisticsPeriod,
    ): Promise<StatisticsResponseDto> {
        this.logger.log(
            `Obteniendo estadísticas del periodo: ${period}`,
        );

        const today = new Date();

        let startDate: Date;
        let endDate: Date;

        switch (period) {
            case "week": {
                const day = today.getDay();

                startDate = new Date(today);
                startDate.setDate(today.getDate() - day);
                startDate.setHours(0, 0, 0, 0);

                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 7);

                break;
            }

            case "month": {
                startDate = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    1,
                );

                endDate = new Date(
                    today.getFullYear(),
                    today.getMonth() + 1,
                    1,
                );

                break;
            }

            case "year": {
                startDate = new Date(
                    today.getFullYear(),
                    0,
                    1,
                );

                endDate = new Date(
                    today.getFullYear() + 1,
                    0,
                    1,
                );

                break;
            }
        }

        const reservations =
            await this.prismaService.reservation.findMany({
                where: {
                    reservationDate: {
                        gte: startDate,
                        lt: endDate,
                    },
                },
                include: {
                    deposits: true,
                },
            });

        const totalReservations = reservations.length;

        const confirmedReservations =
            reservations.filter(
                reservation =>
                    reservation.status === "CONFIRMADA",
            ).length;

        const pendingReservations =
            reservations.filter(
                reservation =>
                    reservation.status === "PENDIENTE",
            ).length;

        const cancelledReservations =
            reservations.filter(
                reservation =>
                    reservation.status === "CANCELADA",
            ).length;

        const finalizedReservations =
            reservations.filter(
                reservation =>
                    reservation.status === "FINALIZADA",
            ).length;

        const totalRevenue =
            reservations.reduce(
                (total, reservation) =>
                    total +
                    Number(reservation.totalReservation),
                0,
            );

        const totalDeposits =
            reservations.reduce(
                (total, reservation) =>
                    total +
                    reservation.deposits.reduce(
                        (depositTotal, deposit) =>
                            depositTotal +
                            Number(deposit.amount),
                        0,
                    ),
                0,
            );

        const reservationsByResource = {
            CANCHA_1: reservations.filter(
                reservation =>
                    reservation.reservationResource === "CANCHA_1",
            ).length,

            CANCHA_2: reservations.filter(
                reservation =>
                    reservation.reservationResource === "CANCHA_2",
            ).length,

            SALON: reservations.filter(
                reservation =>
                    reservation.reservationResource === "SALON",
            ).length,
        };

        const reservationsTimeline: StatisticsTimelineDto[] = [];

        if (period === "week" || period === "month") {
            const currentDate = new Date(startDate);

            while (currentDate < endDate) {
                const reservationsCount = reservations.filter(
                    reservation =>
                        reservation.reservationDate.getDate() ===
                            currentDate.getDate() &&
                        reservation.reservationDate.getMonth() ===
                            currentDate.getMonth() &&
                        reservation.reservationDate.getFullYear() ===
                            currentDate.getFullYear(),
                ).length;

                reservationsTimeline.push({
                    label: currentDate
                        .getDate()
                        .toString()
                        .padStart(2, "0"),
                    reservations: reservationsCount,
                });

                currentDate.setDate(
                    currentDate.getDate() + 1,
                );
            }
        }

        if (period === "year") {
            const months = [
                "Ene",
                "Feb",
                "Mar",
                "Abr",
                "May",
                "Jun",
                "Jul",
                "Ago",
                "Sep",
                "Oct",
                "Nov",
                "Dic",
            ];

            for (let month = 0; month < 12; month++) {
                const reservationsCount = reservations.filter(
                    reservation =>
                        reservation.reservationDate.getMonth() ===
                            month &&
                        reservation.reservationDate.getFullYear() ===
                            today.getFullYear(),
                ).length;

                reservationsTimeline.push({
                    label: months[month],
                    reservations: reservationsCount,
                });
            }
        }

        return {
            period,
            range: {
                startDate,
                endDate,
            },
            summary: {
                totalReservations,
                confirmedReservations,
                pendingReservations,
                cancelledReservations,
                finalizedReservations,
                totalRevenue,
                totalDeposits,
            },
            reservationsByResource,
            reservationsTimeline,
        };
    }
}