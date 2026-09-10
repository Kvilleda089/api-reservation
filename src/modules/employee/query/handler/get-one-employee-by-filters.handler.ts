import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetOneEmployeeByFiltersQuery } from "../impl";
import { Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { handlePrismaError } from "src/database/helpers/prisma-error.handler";
import { buildEmployeeWhere } from "../../common/helper/employee-where.helper";
import { ResponseDto } from "src/common/dto";
import { Employee } from "src/generated/prisma/client";


@QueryHandler(GetOneEmployeeByFiltersQuery)
export class GetOneEmployeeByFiltersHandler implements IQueryHandler<GetOneEmployeeByFiltersQuery> {

    private readonly logger = new Logger(`${GetOneEmployeeByFiltersHandler.name}`);

    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async execute(query: GetOneEmployeeByFiltersQuery): Promise<ResponseDto<Employee>> {

        try {
            const where = buildEmployeeWhere(query.filters);

            const result = await this.prismaService.employee.findFirst({
                where: where,
            });

            if (!result) {
                throw new NotFoundException(`Usuario no encontrado con los parametros enviados ${JSON.stringify(query.filters)}`)
            }

            return {
                statusCode: 201,
                message: 'Información encontrada satisfactoriamente.',
                data: result
            }


        } catch (error) {
            this.logger.error(`Error to created Client error: ${error}`);
            handlePrismaError(
                error,
                `Error al crear Cliente`
            )
        }

    };


}