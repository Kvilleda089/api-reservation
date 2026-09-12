import { IQuery } from "@nestjs/cqrs";
import { PaginationDto } from "src/common/dto";



export class GetAllReservationQuery implements IQuery {
    constructor(
        public readonly pagination: PaginationDto,
    ){}
}