import { IQuery } from "@nestjs/cqrs";



export class GetAgendaQuery implements IQuery {

    constructor(
        public readonly date: string,
    ){}
}