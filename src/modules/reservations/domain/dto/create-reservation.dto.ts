import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ReservationResourceEnum, StatusReservationEnum } from "../enum";
import { Type } from "class-transformer";


export class CreateReservationDto {

    @IsString()
    @IsOptional()
    clientId?: string;

    @IsString()
    @IsNotEmpty()
    hour: string;

    @IsDate()
    @IsNotEmpty()
    @Type(() => Date)
    reservationDate: Date;

    @IsEnum(ReservationResourceEnum, {
        message: `Valores validos ${ReservationResourceEnum}`
    })
    reservationResource: ReservationResourceEnum;

    @IsEnum(StatusReservationEnum, {
        message: `Valores validos ${StatusReservationEnum}`
    })
    status: StatusReservationEnum;

    @IsNumber()
    @IsNotEmpty()
    reservedHours: number;

    @IsNumber()
    @IsNotEmpty()
    totalReservation: number;


}