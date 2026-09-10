import { ICommand } from "@nestjs/cqrs";
import { ChangePasswordDto } from "../../domain/dto";



export class ChangePasswordCommand implements ICommand {
    constructor(
        public readonly id: string,
        public readonly changePassowrdDto: ChangePasswordDto,
    ){}
}