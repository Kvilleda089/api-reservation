import { IQuery } from "@nestjs/cqrs";
import { PaginationDto } from "src/common/dto";


export class GetAllClientQuery implements IQuery {
    constructor(public readonly paginationDto: PaginationDto){}
}