import { Module } from '@nestjs/common';

import { ClientHandler } from './command';
import { PrismaModule } from 'src/database/prisma.module';
import { ClientController } from './controller/client.controller';
import { ClientQuery } from './query';


@Module({
    imports: [PrismaModule,],
    controllers:[ClientController],
    providers:[
        ...ClientHandler,
        ...ClientQuery,
    ]
})
export class ClientsModule {}
