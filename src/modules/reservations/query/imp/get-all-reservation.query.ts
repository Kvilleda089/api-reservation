import { IQuery } from "@nestjs/cqrs";
import { ReservationFiltersDto } from "../../domain/dto/reservation-filters.dto";



export class GetAllReservationQuery implements IQuery {
    constructor(
        public readonly filters: ReservationFiltersDto,
    ){}
}