import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { env } from 'src/config/envs';
import { PrismaService } from 'src/database/prisma.service';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(private readonly prismaService: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: env.jwt_secret,
        });
    }

    async validate(payload: any) {
        if (!payload.jti) {
            throw new UnauthorizedException('Sesión inválida. Inicia sesión nuevamente.');
        }

        const session = await this.prismaService.userSession.findUnique({
            where: { tokenId: payload.jti },
        });

        if (!session || session.revokedAt) {
            throw new UnauthorizedException('La sesión fue cerrada. Inicia sesión nuevamente.');
        }

        return payload;
    }
}