import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateReservationDto } from "../domain/dto/create-reservation.dto";
import { CreateReservationCommand } from "../command/impl/create-reservation.command";
import { GetReservationAvailableDto } from "../domain/dto/get-reservation-available.dto";
import { GetReservationAvailableQuery } from "../query/query/get-reservation-checkout-available.query";
import { UpdateReservationDto } from "../domain/dto/update-reservaton.dto";
import { UpdateReservationCommand } from "../command/impl/update-reservation.command";
import { PaginationDto } from "src/common/dto";
import { GetAllReservationQuery } from "../query/query/get-all-reservation.query";
import { GetReservationByClientIdQuery } from "../query/query/get-reservation-by-clientId.query";
import { JwtAuthGuard } from "src/modules/auth/guard/jwt.auth.guard";

@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationController {


    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    @Post()
    createReservation(@Body() data: CreateReservationDto) {
        return this.commandBus.execute(
            new CreateReservationCommand(data)
        );
    };

    @Get()
    getAllReservation(@Query() paginationDto: PaginationDto){
        return this.queryBus.execute(
            new GetAllReservationQuery(paginationDto)
        )
    }

    @Get('available')
    getReservationAvailable(@Query() filters: GetReservationAvailableDto) {
        return this.queryBus.execute(
            new GetReservationAvailableQuery(filters)
        );
    }  

    @Get('/client/:id')
    getReservationClientById(@Param('id') clientId: string, @Query() paginationDto: PaginationDto) {
        return this.queryBus.execute(
            new GetReservationByClientIdQuery(clientId, paginationDto)
        )
    }

    
    @Patch(':id')
    updateReservationByClientId(@Param('id') id: string, @Body() data: UpdateReservationDto) {
        return this.commandBus.execute(
            new UpdateReservationCommand(id, data)
        )
    }
}