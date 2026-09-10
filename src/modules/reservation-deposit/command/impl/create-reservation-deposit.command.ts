import { ICommand } from "@nestjs/cqrs";
import { CreateReservationDepositDto } from "../../domain/dto/create-reservation-deposit.dto";



export class CreateReservationDepositCommand implements ICommand {
    constructor(
        public readonly data: CreateReservationDepositDto,
    ){}
}