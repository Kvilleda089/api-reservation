import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOneClientQuery } from '../impl/get-one-client.query';

import { ResponseDto } from 'src/common/dto';
import { Client } from 'src/generated/prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { Logger, NotFoundException } from '@nestjs/common';
import { GetOneClientDto } from '../../domain/dto';
import { handlePrismaError } from 'src/database/helpers/prisma-error.handler';
import { getClientFilterMessage } from '../../domain/helpers/client-filter.helper';
import { buildPaginationResponse } from 'src/common/utils/pagination-response.helper';

@QueryHandler(GetOneClientQuery)
export class GetOneClientHandler implements IQueryHandler<GetOneClientQuery> {

    private readonly logger = new Logger(GetOneClientHandler.name);

    constructor(
        private readonly prismaService: PrismaService,
    ) {}

    async execute(query: GetOneClientQuery): Promise<ResponseDto<Client[]>> {
        try {

            const result = await this.getClientsByFilter(
                query.query,
            );

            return buildPaginationResponse(
                result.clients,
                result.pagination,
                'Información encontrada',
            );

        } catch (error) {
            this.logger.error('Error al obtener clientes', error);
            handlePrismaError(
                error,
                'Error al obtener clientes',
            );
        }
    }

    private async getClientsByFilter(query: GetOneClientDto) {

        const {
            page = 1,
            limit = 10,
            id,
            firstName,
            surName,
            email,
            phoneNumber,
        } = query;

        const where = {

            ...(id && {
                id,
            }),

            ...(firstName && {
                firstName: {
                    contains: firstName,
                    mode: 'insensitive' as const,
                },
            }),

            ...(surName && {
                surname: {
                    contains: surName,
                    mode: 'insensitive' as const,
                },
            }),

            ...(email && {
                email: {
                    contains: email,
                    mode: 'insensitive' as const,
                },
            }),

            ...(phoneNumber && {
                phoneNumber: {
                    contains: phoneNumber,
                    mode: 'insensitive' as const,
                },
            }),

        };

        const [totalRecords, clients] = await Promise.all([

            this.prismaService.client.count({
                where,
            }),

            this.prismaService.client.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
            }),

        ]);

        if (clients.length === 0) {
            this.logger.log(`Cliente no encontrado con los parámetros enviados: ${getClientFilterMessage(query)}`,)
            throw new NotFoundException(
                `Cliente no encontrado con los parámetros enviados: ${getClientFilterMessage(query)}`,
            );

        }

        return {
            clients,
            pagination: {
                page,
                limit,
                totalRecords,
            },
        };
    }
}