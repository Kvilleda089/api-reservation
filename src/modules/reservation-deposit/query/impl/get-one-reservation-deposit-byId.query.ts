import { IQuery } from "@nestjs/cqrs";


export class GetOneReservationDepositByIdQuery implements IQuery {
    constructor(
        public readonly id?: string,
        public readonly reservationId?: string,
    ) {}
}