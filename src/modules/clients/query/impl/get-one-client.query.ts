import { IQuery } from "@nestjs/cqrs";
import { ClientFilterDto, GetOneClientDto } from "../../domain/dto";
import { PaginationDto } from "src/common/dto";


export class GetOneClientQuery implements IQuery {
    constructor(
        public readonly query: GetOneClientDto,
    ){}
}