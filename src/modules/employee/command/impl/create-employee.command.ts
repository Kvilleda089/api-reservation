import { ICommand } from "@nestjs/cqrs";
import { CreateEmployeeDto } from "../../domain/dto";


export class CreateEmployeeCommand implements ICommand {
    constructor(
        public readonly data: CreateEmployeeDto,
    ){}
}