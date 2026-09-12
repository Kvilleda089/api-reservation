import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ClientFilterDto, CreateClientDto, UpdateClientDto } from "../domain/dto";
import { CreateClientCommand } from "../command/impl/create-client.command";
import { GetAllClientQuery } from "../query/impl/get-all-client.query";
import { PaginationDto } from "src/common/dto";
import { GetOneClientQuery } from "../query/impl/get-one-client.query";
import { UpdateClientCommand } from "../command/impl/update-client.command";
import { JwtAuthGuard, RolesGuard } from "src/modules/auth/guard";
import { RoleEnum } from "src/common/enum/role.enum";
import { Roles } from "src/modules/auth/decorator/roles.decorator";



@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
    RoleEnum.SUPER_ADMINISTRATOR,
    RoleEnum.ADMINISTRATOR,
)
@Controller('clients')
export class ClientController {

    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    @Post()
    createClient(@Body() data: CreateClientDto) {
        return this.commandBus.execute(new CreateClientCommand(data));
    }

    @Get()
    getAllClient(@Query() paginationDto: PaginationDto) {
        return this.queryBus.execute(new GetAllClientQuery(paginationDto));
    }

    @Get('one')
    getOne(@Query() filter: ClientFilterDto) {
        return this.queryBus.execute(new GetOneClientQuery(filter));
    }

    @Patch(':id')
    updateClient(@Param('id') id: string,
        @Body() dataUpdate: UpdateClientDto) {

        return this.commandBus.execute(new UpdateClientCommand(id, dataUpdate));
    }
}