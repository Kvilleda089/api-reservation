import { IsDate, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateClientDto {

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsOptional()
    middleName: string;

    @IsString()
    @IsNotEmpty()
    surname: string;

    @IsString()
    @IsOptional()
    secondSurname: string;

    @IsString()
    @IsEmail()
    @IsOptional()
    email: string;

    @IsDate()
    @IsOptional()
    dateRegistration: Date;

    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

}