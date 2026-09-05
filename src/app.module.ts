import { Module } from '@nestjs/common';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { ClientsModule } from './modules/clients/clients.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { ReservationDepositModule } from './modules/reservation-deposit/reservation-deposit.module';


@Module({
  imports: [ReservationsModule, ClientsModule, EmployeeModule, ReservationDepositModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
