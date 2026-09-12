import { ICommand } from "@nestjs/cqrs";
import { GetReservationAvailableDto } from "../../domain/dto/get-reservation-available.dto";


export class GetReservationCheckoutAvailableQuery implements ICommand {
    constructor(
        public readonly filters: GetReservationAvailableDto,
    ){}
}