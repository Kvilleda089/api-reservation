import { RoleEnum } from "../enum/role.enum";
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from "class-validator";


export class GetOneEmployeeFiltersDto {


    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    middleName?: string;

    @IsString()
    @IsOptional()
    surname?: string;

    @IsString()
    @IsOptional()
    secondSurname?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    username?: string;

    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @IsEnum(RoleEnum, {
        message: `Valores no validos, solo se permite ${RoleEnum}`
    })
    @IsOptional()
    role?: RoleEnum;

    @IsBoolean()
    @IsOptional()
    status?: boolean;

}