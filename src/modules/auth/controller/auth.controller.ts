import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { LoginDto } from "../domain/dto";
import { LoginCommand, LogoutCommand } from "../command/impl";
import { JwtAuthGuard } from "../guard";


@Controller('auth')
export class AuthController {

    constructor(
        private readonly commandBus: CommandBus,
    ) { }



    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.commandBus.execute(
            new LoginCommand(loginDto)
        )
    };

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    logout(@Req() req: { user: { sub: string; username: string; jti: string } }) {
        const { sub, username, jti } = req.user;

        return this.commandBus.execute(
            new LogoutCommand(sub, username, jti)
        )
    }



}