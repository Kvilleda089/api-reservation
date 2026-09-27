


import { Controller, Get,Query, UseGuards } from "@nestjs/common";
import {  QueryBus } from "@nestjs/cqrs";
import { JwtAuthGuard } from "src/modules/auth/guard/jwt.auth.guard";
import { Roles } from "src/modules/auth/decorator/roles.decorator";
import { RolesGuard } from "src/modules/auth/guard";
import { RoleEnum } from "src/common/enum/role.enum";
import { StatisticsPeriod } from "../domain/type/statistics-periodo";
import { GetStatisticsByPeriodQuery } from "../query/impl/get-statistics-by-period.query";

@UseGuards(JwtAuthGuard)
@Controller('statistics')
export class StatisticsController {


    constructor(
        private readonly queryBus: QueryBus,
    ) { }
    

    @UseGuards(RolesGuard)
    @Roles(RoleEnum.SUPER_ADMINISTRATOR)
    @Get()
    async getStatistics(
        @Query("period") period: StatisticsPeriod,
    ) {
        return this.queryBus.execute(
            new GetStatisticsByPeriodQuery(period),
        );
    }
}