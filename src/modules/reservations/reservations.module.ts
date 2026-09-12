import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma.module';
import { ReservationCommandHadler } from './command/handler';
import { ReservationController } from './controller/reservation.controller';
import { ReservationQueryHandlers } from './query/handler';

@Module({
    imports: [PrismaModule,],
    controllers:[ReservationController],
    providers:[
        ...ReservationCommandHadler,
        ...ReservationQueryHandlers,
    ]
})
export class ReservationsModule {}
