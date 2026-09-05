import { ICommand } from "@nestjs/cqrs";
import { CreateClientDto } from "../../domain/dto";


export class CreateClientCommand implements ICommand {
    constructor(
        public readonly data: CreateClientDto,
    ){}
}