import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateReservationDepositDto } from "../domain/dto/create-reservation-deposit.dto";
import { CreateReservationDepositCommand } from "../command/impl/create-reservation-deposit.command";
import { PaginationDto } from "src/common/dto";
import { GetAllReservationDepositQuery } from "../query/impl/get-all-reservation-deposit.query";
import { GetOneReservationDepositByIdQuery } from "../query/impl/get-one-reservation-deposit-byId.query";
import { JwtAuthGuard } from "src/modules/auth/guard/jwt.auth.guard";

@UseGuards(JwtAuthGuard)
@Controller('reservation-deposit')
export class ReservationDepositController {

    constructor(

        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ){}


    @Post()
    createReservationDeposit(@Body() data: CreateReservationDepositDto) {
        return this.commandBus.execute(
            new CreateReservationDepositCommand(data)
        )
    }

    @Get()
    getAllReservationDeposit(@Query() paginationDto: PaginationDto) {
        return this.queryBus.execute(
            new GetAllReservationDepositQuery(paginationDto)
        )
    }

    @Get('one')
    getOneReservationDeposit(@Query('id') id: string, @Query('reservationId') reservationId: string) {
        return this.queryBus.execute(
            new GetOneReservationDepositByIdQuery(id, reservationId)
        )
    }

}