import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ChangePasswordDto, CreateEmployeeDto, GetOneEmployeeFiltersDto, UpdateEmployeeDto } from "../domain/dto";
import { ChangePasswordCommand, CreateEmployeeCommand, UpdateEmployeeCommand } from "../command/impl";
import { PaginationDto } from "src/common/dto";
import { GetAllEmployeeQuery, GetOneEmployeeByFiltersQuery } from "../query/impl";
import { Roles } from "src/modules/auth/decorator/roles.decorator";
import { RoleEnum } from "src/common/enum/role.enum";
import { JwtAuthGuard, RolesGuard } from "src/modules/auth/guard";

@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeeController {


    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,

    ) { }

    @UseGuards(RolesGuard)
    @Roles(RoleEnum.SUPER_ADMINISTRATOR)
    @Post()
    createEmployee(@Body() data: CreateEmployeeDto) {
        return this.commandBus.execute(
            new CreateEmployeeCommand(data)
        )
    };

    @UseGuards(RolesGuard)
    @Roles(RoleEnum.SUPER_ADMINISTRATOR)
    @Patch(':id')
    updateEmployee(@Param('id') employeeId: string,
        @Body() data: UpdateEmployeeDto) {

            return this.commandBus.execute(
                new UpdateEmployeeCommand(employeeId, data)
            )
    };

    @UseGuards(RolesGuard)
    @Roles(RoleEnum.SUPER_ADMINISTRATOR)
    @Get()
    getAllEmploye(@Query() paginationDto: PaginationDto){
        return this.queryBus.execute(
            new GetAllEmployeeQuery(paginationDto)
        )
    };

    @UseGuards(RolesGuard)
    @Roles(RoleEnum.SUPER_ADMINISTRATOR)
    @Get('one')
    getOneEmploye(@Query() filters: GetOneEmployeeFiltersDto) {
        return this.queryBus.execute(
            new GetOneEmployeeByFiltersQuery(filters)
        )
    };


    @Patch('change-password/:id')
    changePassword(@Param('id') id: string, @Body() changePasswordDto: ChangePasswordDto ) {
        return this.commandBus.execute( 
            new ChangePasswordCommand(id, changePasswordDto)
        )
    }


}