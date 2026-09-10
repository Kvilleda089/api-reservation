import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import * as bcrypt from 'bcrypt';
import { CreateEmployeeCommand } from "../impl/create-employee.command";
import { Logger } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { CreateEmployeeDto, EmployeeResponse } from "../../domain/dto";
import { generateUsername } from "../../common/helper/username.helper";
import { handlePrismaError } from "src/database/helpers/prisma-error.handler";
import { ResponseDto } from "src/common/dto";
import { employeeSelect } from "src/database/select/employee.select";


@CommandHandler(CreateEmployeeCommand)
export class CreateEmployeeHandler implements ICommandHandler<CreateEmployeeCommand> {

    private readonly logger = new Logger(`${CreateEmployeeHandler.name}`);

    constructor(
        private readonly prismaService: PrismaService,
    ) { }


    async execute(command: CreateEmployeeCommand): Promise<ResponseDto<EmployeeResponse>> {

        try {
            const data = await this.createEmployee(command.data);

            return {
                statusCode: 201,
                message: 'Empleado creado correctamente',
                data: data
            }

        } catch (error) {
            this.logger.error(`Error to created Client error: ${error}`);
            handlePrismaError(
                error,
                `Error al crear Cliente`
            )
        }

    }


    private async createEmployee(data: CreateEmployeeDto): Promise<EmployeeResponse> {
        const { password, firstName, surname, ...employeeData } = data;
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const userName = generateUsername(firstName, surname);

        const employee = await this.prismaService.employee.create({
            data: {
                firstName,
                surname,
                ...employeeData,
                password: hashedPassword,
                username: userName,
            },
            select: employeeSelect,
        });

        return employee;

    }
}