import { ICommand } from "@nestjs/cqrs";
import { UpdateEmployeeDto } from "../../domain/dto";



export class UpdateEmployeeCommand implements ICommand {
    constructor(
        public readonly employeeId: string, 
        public readonly dataUdated: UpdateEmployeeDto,
    ){}
}