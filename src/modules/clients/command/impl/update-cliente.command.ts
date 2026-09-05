import { ICommand } from "@nestjs/cqrs";
import { UpdateClientDto } from "../../domain/dto";


export class UpdateClientCommand implements ICommand {
    constructor(
        public readonly clientId: string,
        public readonly data: UpdateClientDto,
    ){}
}