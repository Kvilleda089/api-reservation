import { Module } from '@nestjs/common';
import { CreateReservationDepositHandler } from './command/handler/create-reservation-deposit.handler';
import { PrismaModule } from 'src/database/prisma.module';
import { ReservationDepositController } from './controller/reservation-deposit.controller';
import { ReservationDepositsHandlers } from './query/handler';

@Module({
    imports:[PrismaModule],
    providers:[
        CreateReservationDepositHandler,
        ...ReservationDepositsHandlers,

    ],
    controllers:[
        ReservationDepositController,
        
    ]
})
export class ReservationDepositModule {}
