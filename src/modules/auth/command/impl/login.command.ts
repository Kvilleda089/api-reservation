import { ICommand } from "@nestjs/cqrs";
import { LoginDto } from "../../domain/dto";



export class LoginCommand implements ICommand {
    constructor(
        public readonly loginDto: LoginDto,
    ){}
}