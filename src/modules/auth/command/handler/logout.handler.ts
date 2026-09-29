import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LogoutCommand } from "../impl";
import { Logger } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";


@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {

    private readonly logger = new Logger(`${LogoutHandler.name}`);

    constructor(private readonly prismaService: PrismaService) {}

    async execute(command: LogoutCommand): Promise<void> {
        const { username, employeeId, tokenId } = command;

        await this.prismaService.userSession.updateMany({
            where: { tokenId, revokedAt: null },
            data: { revokedAt: new Date() },
        });

        this.logger.log(`Sesión cerrada correctamente. Usuario: ${username} (${employeeId})`);
    }
}