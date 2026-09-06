import { ICommand } from "@nestjs/cqrs";
import { UpdateReservationDto } from "../../domain/dto/update-reservaton.dto";



export class UpdateReservationCommand implements ICommand {
    constructor(
        public readonly id: string,
        public readonly data: UpdateReservationDto,
    ){}
}