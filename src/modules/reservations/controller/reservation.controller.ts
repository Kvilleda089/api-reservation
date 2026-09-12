import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateReservationDto } from "../domain/dto/create-reservation.dto";
import { CreateReservationCommand } from "../command/impl/create-reservation.command";
import { GetReservationAvailableDto } from "../domain/dto/get-reservation-available.dto";
import { UpdateReservationDto } from "../domain/dto/update-reservaton.dto";
import { UpdateReservationCommand } from "../command/impl/update-reservation.command";
import { PaginationDto } from "src/common/dto";
import { JwtAuthGuard } from "src/modules/auth/guard/jwt.auth.guard";
import { Roles } from "src/modules/auth/decorator/roles.decorator";
import { RolesGuard } from "src/modules/auth/guard";
import { RoleEnum } from "src/common/enum/role.enum";
import { GetAllReservationQuery } from "../query/imp/get-all-reservation.query";
import { GetReservationCheckoutAvailableQuery } from "../query/imp/get-reservation-checkout-available.query";
import { GetReservationByClientIdQuery } from "../query/imp/get-reservation-by-clientId.query";
import { GetAgendaQuery } from "../query/imp/get-agenda.query";

@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationController {


    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    @UseGuards(RolesGuard)
    @Roles(
            RoleEnum.SUPER_ADMINISTRATOR,
            RoleEnum.ADMINISTRATOR
        )
    @Post()
    createReservation(@Body() data: CreateReservationDto) {
        return this.commandBus.execute(
            new CreateReservationCommand(data)
        );
    };

    @UseGuards(RolesGuard)
    @Roles(
        RoleEnum.SUPER_ADMINISTRATOR,
        RoleEnum.ADMINISTRATOR
    )
    @Get()
    getAllReservation(@Query() paginationDto: PaginationDto){
        return this.queryBus.execute(
            new GetAllReservationQuery(paginationDto)
        )
    }

    @UseGuards(RolesGuard)
    @Roles(
        RoleEnum.SUPER_ADMINISTRATOR,
        RoleEnum.ADMINISTRATOR
    )
    @Get('available')
    getReservationAvailable(@Query() filters: GetReservationAvailableDto) {
        return this.queryBus.execute(
            new GetReservationCheckoutAvailableQuery(filters)
        );
    }  

     @UseGuards(RolesGuard)
    @Roles(RoleEnum.SUPER_ADMINISTRATOR)
    @Get('/client/:id')
    getReservationClientById(@Param('id') clientId: string, @Query() paginationDto: PaginationDto) {
        return this.queryBus.execute(
            new GetReservationByClientIdQuery(clientId, paginationDto)
        )
    }

    @UseGuards(RolesGuard)
    @Roles(
        RoleEnum.SUPER_ADMINISTRATOR,
        RoleEnum.ADMINISTRATOR
    )
    @Patch(':id')
    updateReservationByClientId(@Param('id') id: string, @Body() data: UpdateReservationDto) {
        return this.commandBus.execute(
            new UpdateReservationCommand(id, data)
        )
    }

    @Get('agenda/:date')
    getAgenda(@Param('date') date: string) {
        return this.queryBus.execute(
            new GetAgendaQuery(date)
        )
    }
}