import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateClientCommand } from "../impl/update-client.command";
import { handlePrismaError } from "src/database/helpers/prisma-error.handler";
import { Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { UpdateClientDto } from "../../domain/dto";
import { Client } from "src/generated/prisma/client";
import { ResponseDto } from "src/common/dto";

@CommandHandler(UpdateClientCommand)
export class UpdateClientHandler implements ICommandHandler<UpdateClientCommand> {

    private readonly logger = new Logger('UpdateClientHandler');

    constructor(
        private readonly prismaService: PrismaService,

    ) { }
    async execute(command: UpdateClientCommand): Promise<ResponseDto<Client>> {
        try {
            const { clientId, data } = command;
            const result = await this.updateCliente(clientId, data);

            return {
                statusCode: 200,
                message: 'Actualización se ha realizado correctamente.',
                data: result
            }

        } catch (error) {
            this.logger.error(`Error to created Client error: ${error}`);
            handlePrismaError(
                error,
                `Error al crear Cliente`
            )
        }
    }


    private async updateCliente(clientId: string, dataUpdate: UpdateClientDto): Promise<Client> {
        const client = await this.prismaService.client.findFirst({
            where: {
                id: clientId
            }
        });

        if (!client) {
            throw new NotFoundException(`Cliente no encontrado con el id ${clientId}`)
        }
        const updateClient = await this.prismaService.client.update({
            where: {
                id: clientId,
            },
            data: dataUpdate
        })
        return updateClient;
    }
}