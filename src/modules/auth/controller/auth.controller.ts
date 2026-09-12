import { Body, Controller, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { LoginDto } from "../domain/dto";
import { LoginCommand, LogoutCommand } from "../command/impl";


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
    logout( ) {
        return this.commandBus.execute(
            new LogoutCommand()
        )
    }



}