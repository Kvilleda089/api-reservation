import { ICommand } from "@nestjs/cqrs";
import { CreateReservationDto } from "../../domain/dto/create-reservation.dto";


export class CreateReservationCommand implements ICommand {

    constructor(
        public readonly data: CreateReservationDto
    ){}
}