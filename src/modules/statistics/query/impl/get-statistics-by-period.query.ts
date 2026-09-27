import { IQuery } from "@nestjs/cqrs";
import { StatisticsPeriod } from "../../domain/type/statistics-periodo";


export class GetStatisticsByPeriodQuery implements IQuery {

    constructor(
        public readonly period: StatisticsPeriod,
    ){}
}