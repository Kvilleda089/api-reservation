import { ICommand } from "@nestjs/cqrs";
import { GetReservationAvailableDto } from "../../domain/dto/get-reservation-available.dto";


export class GetReservationAvailableQuery implements ICommand {
    constructor(
        public readonly filters: GetReservationAvailableDto,
    ){}
}