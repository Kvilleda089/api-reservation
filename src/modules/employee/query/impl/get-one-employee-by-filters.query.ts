import { IQuery } from "@nestjs/cqrs";
import { GetOneEmployeeFiltersDto } from "../../domain/dto";



export class GetOneEmployeeByFiltersQuery implements IQuery {
    constructor(
        public readonly filters: GetOneEmployeeFiltersDto,
    ){}
}