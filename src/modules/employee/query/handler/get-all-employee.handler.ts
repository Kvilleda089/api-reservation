import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllEmployeeQuery } from "../impl";
import { Logger } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { handlePrismaError } from "src/database/helpers/prisma-error.handler";
import { ResponseDto } from "src/common/dto";
import { EmployeeResponse } from "../../domain/dto";
import { employeeSelect } from "src/database/select/employee.select";


@QueryHandler(GetAllEmployeeQuery)
export class GetAllEmployeeHandler implements IQueryHandler<GetAllEmployeeQuery> {

    private readonly logger = new Logger(`${GetAllEmployeeHandler.name}`);

    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async execute(query: GetAllEmployeeQuery): Promise<ResponseDto<EmployeeResponse[]>> {
        try {
            const { page = 1, limit = 10 } = query.paginationDto;
            const totalRecords = await this.prismaService.employee.count();

            this.logger.log(`Total de registros encontrados ${totalRecords}`)
            const lastPage = Math.ceil(totalRecords / limit);

            const employees = await this.prismaService.employee.findMany({
                skip: (page - 1) * limit,
                take: limit,
                select: employeeSelect,
            });

            return {
                statusCode: 200,
                data: employees,
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