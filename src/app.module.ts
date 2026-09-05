import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { ClientsModule } from './modules/clients/clients.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { ReservationDepositModule } from './modules/reservation-deposit/reservation-deposit.module';
import { PrismaModule } from './database/prisma.module';


@Module({
  imports: [
    PrismaModule,
    CqrsModule.forRoot(),
    ReservationsModule, 
    ClientsModule, 
    EmployeeModule, 
    ReservationDepositModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
