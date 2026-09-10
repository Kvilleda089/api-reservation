import { IsNotEmpty, IsNumber, IsString } from "class-validator";



export class CreateReservationDepositDto {

    @IsNumber()
    @IsNotEmpty()
    amount: number;
    
    @IsString()
    @IsNotEmpty()
    reservationId: string;
}