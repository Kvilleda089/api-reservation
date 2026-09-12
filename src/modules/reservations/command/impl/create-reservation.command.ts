import { ICommand } from "@nestjs/cqrs";
import { CreateReservationDataDto } from "../../domain/dto/create-reservation-data.dto";


export class CreateReservationCommand implements ICommand {

    constructor(
        public readonly data: CreateReservationDataDto,
    ){}
}