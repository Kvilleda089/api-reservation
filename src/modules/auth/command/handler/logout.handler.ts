import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LogoutCommand } from "../impl";
import { Logger } from "@nestjs/common";


@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {

    private readonly logger = new Logger(`${LogoutHandler.name}`);

    constructor(){}

    async execute(command: LogoutCommand):Promise<void> {
        this.logger.log(`Sesión cerrada correctamente.`)
    }
}