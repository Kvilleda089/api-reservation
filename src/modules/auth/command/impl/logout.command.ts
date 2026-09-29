import { ICommand } from "@nestjs/cqrs";



export class LogoutCommand implements ICommand {
    constructor(
        public readonly employeeId: string,
        public readonly username: string,
        public readonly tokenId: string,
    ){}
}