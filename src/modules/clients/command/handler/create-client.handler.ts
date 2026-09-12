import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Client } from 'src/generated/prisma/client';
import { CreateClientCommand } from "../impl/create-client.command";
import { ResponseDto } from "src/common/dto/response.dto";
import { Logger } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { handlePrismaError } from "src/database/helpers/prisma-error.handler";



@CommandHandler(CreateClientCommand)
export class CreateClientHandler implements ICommandHandler<CreateClientCommand> {

    private readonly logger = new Logger(`${CreateClientHandler.name}`)
    constructor(
        private readonly prismaService: PrismaService,

    ) { }

    async execute(command: CreateClientCommand): Promise<ResponseDto<Client>> {
        this.logger.log(`Execute CreateHandler`)
        try {
            const client = await this.prismaService.client.create({
                data: command.data,

            });

            return {
                statusCode: 201,
                data: client,
                message: 'SUCCESS'
            }

        } catch (error) {
            this.logger.error(`Error to created Client error: ${error}`);
            handlePrismaError(
                error,
                `Error al crear Cliente`
            )
        }

    }
}