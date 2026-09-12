import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import * as bcrypt from 'bcrypt';
import { ChangePasswordCommand } from "../impl";
import { BadRequestException, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { ChangePasswordDto, EmployeeResponse } from "../../domain/dto";
import { employeeSelect } from "src/database/select/employee.select";
import { ResponseDto } from "src/common/dto";
import { handlePrismaError } from "src/database/helpers/prisma-error.handler";


@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {

    private readonly logger = new Logger(`${ChangePasswordHandler.name}`);

    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async execute(command: ChangePasswordCommand): Promise<ResponseDto<EmployeeResponse>> {
        try {

            const { id, changePassowrdDto } = command
            const result = await this.changePasswor(id, changePassowrdDto);

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
    };


    private async changePasswor(id: string, changePasswordDto: ChangePasswordDto): Promise<EmployeeResponse> {
        const { currentPassword, newPassword } = changePasswordDto
        const employee = await this.prismaService.employee.findFirst({
            where: {
                id
            },
            select: {
                id: true,
                password: true,
            }
        });

        if (!employee) {
            this.logger.log(`Empleado no encontrado con el ID: ${id}`)
            throw new NotFoundException(`Empleado no encontrado con el ID: ${id} `)
        };

        const isPasswordValid = await bcrypt.compare(currentPassword, employee.password);

        if (!isPasswordValid) {
            throw new BadRequestException(`Lo sentimos, ocurrió un error. La contreña no es correcta`)
        };

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const result = await this.prismaService.employee.update({
            where: {
                id,
            },
            data: {
                password: hashedPassword
            },
            select: employeeSelect,
        })

        return result;
    }
}