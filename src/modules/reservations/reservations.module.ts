import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma.module';
import { ReservationHadler } from './command/handler';
import { ReservationController } from './controller/reservation.controller';
import { ReservationQueryHandlers } from './query/handler';

@Module({
    imports: [PrismaModule,],
    controllers:[ReservationController],
    providers:[
        ...ReservationHadler,
        ...ReservationQueryHandlers,
    ]
})
export class ReservationsModule {}
