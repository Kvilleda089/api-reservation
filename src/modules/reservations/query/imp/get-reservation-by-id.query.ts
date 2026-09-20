import { IQuery } from "@nestjs/cqrs";



export class GetReservationByIdQuery implements IQuery {
    constructor(
        public readonly id: string,
    ){}
}