import { CreateClientDto } from "src/modules/clients/domain/dto";
import { CreateReservationDto } from "src/modules/reservations/domain/dto/create-reservation.dto";
import { CreateReservationDepositDto } from "../../../reservation-deposit/domain/dto/create-reservation-deposit.dto";



export class CreateReservationDepositDataDto {

    client: CreateClientDto;
    reservartion: CreateReservationDto;
    deposit?: CreateReservationDepositDto;
}