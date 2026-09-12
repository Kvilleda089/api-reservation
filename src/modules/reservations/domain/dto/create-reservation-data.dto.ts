import { CreateClientDto } from "src/modules/clients/domain/dto";
import { CreateReservationDto } from "./create-reservation.dto";
import { CreateReservationDepositDto } from "src/modules/reservation-deposit/domain/dto/create-reservation-deposit.dto";
import { ValidateNested } from "class-validator";
import { Type } from "class-transformer";



export class CreateReservationDataDto {

    @ValidateNested()
    @Type(() => CreateClientDto)
    client: CreateClientDto;

    @ValidateNested()
    @Type(() => CreateReservationDto)
    reservation: CreateReservationDto;

    @ValidateNested()
    @Type(() => CreateReservationDepositDto)
    deposit?: CreateReservationDepositDto;
}