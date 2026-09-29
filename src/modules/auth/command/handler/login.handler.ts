import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginCommand } from "../impl";
import { BadRequestException, Logger } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { LoginDto, LoginResponseDto } from "../../domain/dto";
import { RoleEnum } from "src/common/enum/role.enum";
import { handlePrismaError } from "src/database/helpers/prisma-error.handler";
import { randomUUID } from 'crypto';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {

    private readonly logger = new Logger(`${LoginHandler.name}`);

    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async execute(command: LoginCommand): Promise<LoginResponseDto> {

        try {
            const { loginDto } = command;
            const userAuth = await this.loggin(loginDto);

            return userAuth;
        } catch (error) {
            this.logger.error(`Error to created Client error: ${error}`);
            handlePrismaError(
                error,
                `Error al crear Cliente`
            )
        }
    }


    private async loggin(loginDto: LoginDto): Promise<LoginResponseDto> {
        const { username, password } = loginDto;
        const employee = await this.prismaService.employee.findFirst({
            where: {
                username: username,
                status: true,
            },
        });

        if (!employee) {
            throw new BadRequestException(`Lo sentimos, ocurrió un error. No se ha encontrado información con el usuario o no se encuentra activo.`)
        }

        const isValidPassword = await bcrypt.compare(password, employee.password);

        if (!isValidPassword) {
            throw new BadRequestException(`Lo sentimos, ocurrió un error. Credenciales incorrectas.`)
        };


        const payload = {
            sub: employee.id,
            username: employee.username,
            role: employee.role,
        }

        const tokenId = randomUUID();
        const accessToken = this.jwtService.sign(payload, { jwtid: tokenId });

        // Se lee la expiración del propio token para no repetir la configuración.
        const { exp } = this.jwtService.decode<{ exp: number }>(accessToken);


        await this.prismaService.userSession.create({
            data: {
                employeeId: employee.id,
                tokenId,
                expiresAt: new Date(exp * 1000), // exp viene en segundos
            },
        });

        const response: LoginResponseDto = {
            accessToken,
            employee: {
                id: employee.id,
                username: employee.username,
                firstName: employee.firstName,
                surname: employee.surname,
                role: RoleEnum[employee.role]
            }
        }
        return response;
    }
}