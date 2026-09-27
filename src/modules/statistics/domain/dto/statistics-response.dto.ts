import { StatisticsPeriod } from "../../domain/type/statistics-periodo";

export class StatisticsRangeDto {
    startDate: Date;
    endDate: Date;
};

export class StatisticsSummaryDto {
    totalReservations: number;
    confirmedReservations: number;
    pendingReservations: number;
    cancelledReservations: number;
    finalizedReservations: number;
    totalRevenue: number;
    totalDeposits: number;
};

export class StatisticsResourceDto {
    CANCHA_1: number;
    CANCHA_2: number;
    SALON: number;
};


export class StatisticsResponseDto {
    period: StatisticsPeriod;
    range: StatisticsRangeDto;
    summary: StatisticsSummaryDto;
    reservationsByResource: StatisticsResourceDto;
}