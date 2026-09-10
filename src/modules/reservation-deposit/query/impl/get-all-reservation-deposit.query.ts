import { IQuery } from "@nestjs/cqrs";
import { PaginationDto } from "src/common/dto";



export class GetAllReservationDepositQuery implements IQuery {
    constructor(
        public readonly paginationDto: PaginationDto,
    ){}
}