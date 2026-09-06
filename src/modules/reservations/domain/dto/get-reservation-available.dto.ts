import { IsDate, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Type } from "class-transformer";
import { ReservationResourceEnum } from "../enum";


export class GetReservationAvailableDto {


    @IsString()
    hour: string;

    @IsDate()
    @Type(() => Date)
    reservationDate: Date;

    @IsEnum(ReservationResourceEnum, {
        message: `Valores válidos ${ReservationResourceEnum}`
    })
    @IsNotEmpty()
    reservationResource: ReservationResourceEnum;

}