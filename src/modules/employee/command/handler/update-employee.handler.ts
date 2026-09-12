import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateEmployeeCommand } from "../impl";
import { Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { EmployeeResponse, UpdateEmployeeDto } from "../../domain/dto";
import { Employee } from "src/generated/prisma/client";
import { ResponseDto } from "src/common/dto";
import { handlePrismaError } from "src/database/helpers/prisma-error.handler";
import { employeeSelect } from "src/database/select/employee.select";


@CommandHandler(UpdateEmployeeCommand)
export class UpdateEmployeeHandler implements ICommandHandler<UpdateEmployeeCommand> {

    private readonly logger = new Logger(`${UpdateEmployeeHandler.name}`)

    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async execute(command: UpdateEmployeeCommand): Promise<ResponseDto<EmployeeResponse>> {
        try {
            const { employeeId, dataUdated } = command;

            const result = await this.updateEmployeeById(employeeId, dataUdated);

            return {
                statusCode: 200,
                message: 'Actualización realizada correctamente',
                data: result,
            }

        } catch (error) {
            this.logger.error(`Error to created Client error: ${error}`);
            handlePrismaError(
                error,
                `Error al crear Cliente`
            )
        }
    }

    private async updateEmployeeById(id: string, dataUpdate: UpdateEmployeeDto): Promise<EmployeeResponse> {
        const employee = await this.prismaService.employee.findFirst({
            where: {
                id: id,
            },
        });

        if (!employee) {
            this.logger.log(`No se ha encontrado resultado con el ID: ${id}`);
            throw new NotFoundException(`No se ha encontrado resultado con el ID: ${id}`)
        };


        const updateEmployee = await this.prismaService.employee.update({
            where: {
                id: id
            },
            data: dataUpdate,
            select: employeeSelect,
        });


        return updateEmployee;
    }
}