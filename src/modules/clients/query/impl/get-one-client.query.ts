import { IQuery } from "@nestjs/cqrs";
import { ClientFilterDto } from "../../domain/dto";


export class GetOneClientQuery implements IQuery {
    constructor(
        public readonly filter: ClientFilterDto,
    ){}
}