import { IsEnum, IsOptional, IsString } from "class-validator";
import { StatusReservationEnum } from "../enum";
import { PaginationDto } from "src/common/dto";

export class ReservationFiltersDto extends PaginationDto {

    @IsString()
    @IsOptional()
    client?: string;

    @IsString()
    @IsOptional()
    date?: string;

    @IsString()
    @IsOptional()
    hour?: string;

    @IsEnum(StatusReservationEnum, {
        message: `Valores validos ${JSON.stringify(StatusReservationEnum)} `
    })
    @IsOptional()
    status?: StatusReservationEnum;
}