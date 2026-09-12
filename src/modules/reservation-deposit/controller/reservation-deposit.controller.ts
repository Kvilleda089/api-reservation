import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateReservationDepositDto } from "../domain/dto/create-reservation-deposit.dto";
import { CreateReservationDepositCommand } from "../command/impl/create-reservation-deposit.command";
import { PaginationDto } from "src/common/dto";
import { GetAllReservationDepositQuery } from "../query/impl/get-all-reservation-deposit.query";
import { GetOneReservationDepositByIdQuery } from "../query/impl/get-one-reservation-deposit-byId.query";
import { JwtAuthGuard } from "src/modules/auth/guard/jwt.auth.guard";
import { RolesGuard } from "src/modules/auth/guard";
import { RoleEnum } from "src/common/enum/role.enum";
import { Roles } from "src/modules/auth/decorator/roles.decorator";

@UseGuards(JwtAuthGuard)
@Controller('reservation-deposit')
export class ReservationDepositController {

    constructor(

        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ){}


    @UseGuards(RolesGuard)
    @Roles(RoleEnum.SUPER_ADMINISTRATOR)
    @Post()
    createReservationDeposit(@Body() data: CreateReservationDepositDto) {
        return this.commandBus.execute(
            new CreateReservationDepositCommand(data)
        )
    }

    @UseGuards(RolesGuard)
    @Roles(
        RoleEnum.SUPER_ADMINISTRATOR,
        RoleEnum.ADMINISTRATOR
    )
    @Get()
    getAllReservationDeposit(@Query() paginationDto: PaginationDto) {
        return this.queryBus.execute(
            new GetAllReservationDepositQuery(paginationDto)
        )
    }

    @UseGuards(RolesGuard)
    @Roles(
        RoleEnum.SUPER_ADMINISTRATOR,
        RoleEnum.ADMINISTRATOR
    )
    @Get('one')
    getOneReservationDeposit(@Query('id') id: string, @Query('reservationId') reservationId: string) {
        return this.queryBus.execute(
            new GetOneReservationDepositByIdQuery(id, reservationId)
        )
    }

}