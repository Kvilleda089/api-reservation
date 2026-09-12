import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";



export class CreateReservationDepositDto {

    @IsNumber()
    @IsNotEmpty()
    amount: number;
    
    @IsString()
    @IsOptional()
    reservationId?: string;
}