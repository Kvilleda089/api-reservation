import { Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ResponseDto } from "src/common/dto/response.dto";
import { handlePrismaError } from "src/database/helpers/prisma-error.handler";
import { Client } from "src/generated/prisma/client";
import { GetAllClientQuery } from "../impl/get-all-client.query";
import { PrismaService } from "src/database/prisma.service";


@QueryHandler(GetAllClientQuery)
export class GetAllClientHandler implements IQueryHandler<GetAllClientQuery> {
    private readonly logger = new Logger(`${GetAllClientHandler.name}`)

    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async execute(query: GetAllClientQuery): Promise<ResponseDto<Client[]>> {
        this.logger.log(`Execute GetAllClientQuery`)
        try {
            const { page = 1, limit = 10 } = query.paginationDto;
            const totalRecords = await this.prismaService.client.count();

            this.logger.log(`Total de registros encontrados ${totalRecords}`)
            const lastPage = Math.ceil(totalRecords / limit);

            const clients = await this.prismaService.client.findMany({
                skip: (page - 1) * limit,
                take: limit,
            });

            return {
                statusCode: 200,
                data: clients,
                message: 'Resultados obtenidos',
                pagination: {
                    page,
                    limit,
                    totalRecords,
                    lastPage,
                },
            };

        } catch (error) {
            this.logger.error(`Error to created Client error: ${error}`);
            handlePrismaError(
                error,
                `Error al crear Cliente`
            )
        }
    }
}