import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma.module';
import { AuthController } from './controller/auth.controller';
import { AuthHandlers } from './command/handler';
import { JwtModule } from '@nestjs/jwt';
import { env } from 'src/config/envs';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({

    imports:[
        PrismaModule,
        JwtModule.register({
            secret: env.jwt_secret,
            signOptions : {
                expiresIn: env.jwt_expires_in
            }
        })
    
    ],
    providers:[
        ...AuthHandlers,
        JwtStrategy,
    ],
    controllers: [
        AuthController
    ]
})
export class AuthModule {}
