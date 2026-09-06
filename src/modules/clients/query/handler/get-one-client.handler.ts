import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetOneClientQuery } from "../impl/get-one-client.query";
import { ResponseDto } from "src/common/dto";
import { Client } from "src/generated/prisma/client";
import { PrismaService } from "src/database/prisma.service";
import { Logger, NotFoundException } from "@nestjs/common";
import { ClientFilterDto } from "../../domain/dto";
import { handlePrismaError } from "src/database/helpers/prisma-error.handler";
import { getClientFilterMessage } from "../../domain/helpers/client-filter.helper";


@QueryHandler(GetOneClientQuery)
export class GetOneClientHandler implements IQueryHandler<GetOneClientQuery> {
    private readonly logger = new Logger('GetOneClientHandler')

    constructor(
        private readonly prismaService: PrismaService,
    ) { }


    async execute(query: GetOneClientQuery): Promise<ResponseDto<Client[]>> {

        try {
            const { filter } = query;
            const client = await this.getOneClientByFilter(filter);

            return {
                statusCode: 200,
                message: 'Información encontrada',
                data: client
            }
        } catch (error) {
            this.logger.error(`Error to created Client error: ${error}`);
            handlePrismaError(
                error,
                `Error al crear Cliente`
            )
        }
    }



   private async getOneClientByFilter(filter: ClientFilterDto): Promise<Client[]> {
        const client = await this.prismaService.client.findMany({
            where: {
                ...(filter.id && {
                    id: filter.id,
                }),

                ...(filter.firstName && {
                    firstName: {
                        contains: filter.firstName,
                        mode: 'insensitive',
                    }
                }),

                ...(filter.surName && {
                    surname: {
                        contains: filter.firstName,
                        mode: 'insensitive',
                    }
                }),

                ...(filter.email && {
                    email: {
                        contains: filter.email,
                        mode: 'insensitive',
                    }
                }),

                ...(filter.phoneNumber && {
                    phoneNumber: {
                        contains: filter.phoneNumber,
                        mode: 'insensitive',
                    }
                }),
            }
        });

        if (client.length === 0) {
            throw new NotFoundException(`Cliente no encontrado con los parametros enviados : ${getClientFilterMessage(filter)}`)
        }
        return client;
    }
}