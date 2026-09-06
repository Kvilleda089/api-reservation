import { IQuery } from "@nestjs/cqrs";
import { PaginationDto } from "src/common/dto";



export class GetReservationByClientIdQuery implements IQuery {
    constructor(
        public readonly clientId: string,
        public readonly paginationDto: PaginationDto,
    ){}
}